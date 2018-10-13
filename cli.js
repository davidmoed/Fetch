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
const outFolder = __dirname + args[1];
mkdirp(outFolder, function (err) {
   if (err) return err;
});



//check for correct input
if (args.length < 2 || args.length > 3) {
   console.log(errorOut('There can only be 2 inputs: get-pics [website] [output folder]'));
} else {

   const imageUrlArr = [];

   //I know you didn't ask for this, but for debug it's very helpful to be able to set a limit on the number of images grabbed
   //I set a base amount of 15
   let imageLimit = 15;
   if (args[2] != undefined) {
      imageLimit = args[2];
   }

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

         //capture image urls in an array
         $('img').each(function (i) {

            let imgUrl = $(this).attr('src');

            imageUrlArr.push(imgUrl);


            // Download to a directory and save with the original filename
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

            return i < imageLimit - 1;
         });

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
