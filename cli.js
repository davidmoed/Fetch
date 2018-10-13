#!/usr/bin/env node

//imports
const request = require('request');
const rp = require('request-promise'); //allows http requests with promises
const cheerio = require('cheerio'); //allows access to DOM (jquery for Node.js)
const mkdirp = require('mkdirp'); //will create a folder if it does not already exist
const downloader = require('image-downloader'); //download the images into the created folder
const chalk = require('chalk'); //cli styling
const fs = require('fs');

//set styling for outputs
const successOut = chalk.green;
const errorOut = chalk.bold.red;
const highlightOut = chalk.yellowBright;


//get args from cli (skip first 2 args)
const args = process.argv.slice(2);
const site = args[0];

//set the output folder based on the current directory
//create a new folder if the folder name specified doesn't exist

let outFolderName = args[1];
//check for a leading slash on the input
if (outFolderName[0] !== '/')
   outFolderName = '/' + outFolderName;

const outFolder = __dirname + outFolderName;
mkdirp(outFolder, function (err) {
   if (err) return err;
});



//check for correct input
if (args.length < 2 || args.length > 4) {
   console.log(errorOut('There can only be 4 inputs: fetch [website] [output folder] [number of photos to scrape] [-bg (scrape background images as well)]'));
} else {

   const imageUrlArr = [];

   //I know you didn't ask for this, but for debug it's very helpful to be able to set a limit on the number of images grabbed
   //I set a base amount of 15
   let imageLimit = 15;
   if (args[2] != undefined) {
      imageLimit = args[2];
   }
   let imageCounter = 0;

//get data from html page and pull all images
   //set options for request to get url and html
   const rpOptions = {
      uri: site,
      transform: function (body) {
         return cheerio.load(body);
      }
   };

   //scrape and parse the data or throw an err
   rp(rpOptions)
      .then(($) => {
         console.log(successOut('scraping ' + highlightOut(site) + ' and putting the new file in ' + highlightOut(outFolder)));

         //set a variable for the total number of non-background images
         let regImages = 0;

         //capture image urls in an array
         $('img').each(function() {

            let imgUrl = $(this).attr('src');

            //check for duplicate images and do not count duplicates in the total count
            if (imageUrlArr.indexOf(imgUrl) === -1) {
               imageUrlArr.push(imgUrl);
            } else {
               imageCounter--;
            }

            //increment the overall image counter to ensure the total number of images
            //is cumulative with the bg images
            imageCounter++;

            //console.log('imageLimit: ' + imageLimit + ' imageCounter: ' + imageCounter);

            return imageCounter < imageLimit;
         });




         if( args[3] === '-bg') {
            //output number of regular images
            regImages = imageUrlArr.length;
            console.log('Total <img> images captured: ' + regImages);

            $('figure').each(function() {

               //capture image url style and remove the surrounding css url - (url(... image url here ...))
               let imgUrl = $(this).css('background-image');

               if (imgUrl !== undefined && imgUrl !== null) {
                  imgUrl = imgUrl.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');

                  //check for duplicate images and do not count duplicates in the total count
                  if (imageUrlArr.indexOf(imgUrl) === -1) {
                     imageUrlArr.push(imgUrl);
                  } else {
                     imageCounter--;
                  }
                  //console.log(imgUrl);
               }

               //increment the overall image counter to ensure the total number of images
               //is cumulative with the bg images
               imageCounter++;

               //console.log('imageLimit: ' + imageLimit + ' imageCounter: ' + imageCounter);

               return imageCounter < imageLimit;
            });

            //output number of background images
            console.log('Total background images captured: ' + (imageUrlArr.length - regImages));
         }

         // Download to a directory and save with the original filename
         imageUrlArr.forEach(function( imgUrl ) {
            console.log(imgUrl);
            const options = {
              url: imgUrl,
              dest: outFolder,
              done: function(err, filename, image) {
                if (err) {
                  throw err
                }
                //console.log('File saved to', filename)
              }
            }
            downloader(options);


         })

         console.log(successOut('you successfully scraped ' + highlightOut(imageUrlArr.length) + ' images from ' + site));

//create a new html file with the images and links
         const pageStyles = '<style>body{margin: 30px; font-family: "Verdana";background-color: #e6f7ff} h1{text-align:center; color: #0099ff} img{max-width: 120px;}tr{min-height: 150px} table{margin: auto auto;} th{color: #0099ff} td{max-width:350px; padding: 10px;} a{text-decoration:none;color:#ff944d} a:hover{color: #ff751a}</style>'

         const htmlHead = '<!DOCTYPE html><head><title>' +site + '\'s images</title>' + pageStyles + '</head>'

         let htmlBody = '<body><h1>Images from <a href="'+ site +'">'+ site +'</a></h1><table><tr><th>Images</th><th>Links</th></tr>';

         //add a table row for each image
         imageUrlArr.forEach(function(imgSrc) {
            htmlBody += '<tr><td><img src="' + imgSrc +'"></td><td><a href="' + imgSrc +'" target="_blank">' + imgSrc +'</a></td></tr>'
         });

         htmlBody += '</table></body>'

         const fullHtml = htmlHead + htmlBody;
         //create the file with the html in the output folder
         const fileName = outFolder + '/siteImages.html';
         const stream = fs.createWriteStream(fileName);

         stream.on('error', function(e) { console.error(e); });
         stream.write(fullHtml);
         stream.end();
         console.log(successOut('HTML page sucessfully created'));

      })
      .catch((err) => {
         console.log(errorOut('Error accessing ' + site + ' please check that the input is properly formatted as it appears in the browser. ex. https//:www.google.com'));
         console.log(err);
   });

}
