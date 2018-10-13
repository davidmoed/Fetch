# Fetch

Fetch is a simple CLI web scraper that captures images from almost any website. The scraper downloads the images into a specified folder, and creates an HTML file with all the scraped images, and their urls. The program uses es6 vanilla Javascript and Node.js to find all '<img>' tags in a page's DOM and capture their src. Using the -bg flag at the end of the input, you can choose to scrape background images (often used in wordpress sites for posts) if there are fewer regular image tags on the site than your limit.

To use it, download the repository, and install Node and NPM on your CLI. First run npm install in the local directory. After simply type $fetch [website url] [folder to output] and optionally [number of pictures to download] [-bg].

For example: `fetch https://www.google.com pics 10 -bg`
