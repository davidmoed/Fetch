# Fetch

Fetch is a simple CLI web scraper that captures images from almost any website. The scraper downloads the images into a specified folder, and creates an HTML file with all the scraped images, and their urls. The program uses es6 vanilla Javascript and Node.js to find all '<img>' tags in a page's DOM and capture their src. Using the -bg flag at the end of the input, you can choose to scrape background images (often used in wordpress sites for posts) if the limit set does not capture enough inline images, or if you would simply like to capture all images on the page.

To use it, download the repository, and install Node and NPM on your CLI. First run npm install in the local directory. After simply type $fetch [website url] [folder to output] and optionally [number of pictures to download] [-bg].

Sample usage:

### full usage
`fetch https://www.google.com pics 10 -bg`

### usage with limit and without background images
`fetch https://www.google.com pics 10`

### usage without limit and with background images
`fetch https://www.google.com pics -bg`

### usage without limits and background images
`fetch https://www.google.com pics`
