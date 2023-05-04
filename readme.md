# Usage
This code uses the Puppeteer library to login to a user account on the Bandcamp music platform and scrapes data from several API endpoints. The scraped data is then processed and written to a JSON file.

## Prerequisites
- Node.js 
- Puppeteer library
- Axios library


# Installation
### Local Usage

1. Clone the repository
2. Install dependencies by running npm install
3. Install xvfb 
4. Place your Bandcamp account login credentials in data/cred.json
5. use the command to run with xvfb 
   
    `xvfb-run --server-args="-screen 0 1024x768x24" node src/bandcampScraper.js data/cred.json`


## Docker Usage
1. Place your Bandcamp account login credentials in data/cred.json
2. Install docker https://docs.docker.com/get-docker/

## Docker with makefile
1. Build the Docker image:

    To build the Docker image, run the following command: `make build`
    This will build the Docker image with the name "bandcamp".
    
2. Run the Docker container:
    - Modify the makefile with the directory to mount the output to 
    
    - The network mode will be set to "host".
    - The container will run the "src/bandcampScraper.js" script, passing in the "data/creds.json" file as a parameter.
    - Run the command `make run`
## Docker without makefile
1. docker build -t `image_name` .
2. docker run -v `directory_to_mount`:/app  --network=host -it `image_name` src/bandcampScraper.js data/creds.json


# Observations and Improvments
1. To log in to the site, they use Google reCAPTCHA a captcha result header must be included in the request. This is why I am using Puppeteer.

2. So far, I have not encountered any bans, but multiple login attempts within a short period trigger captchas. As a possible improvement, we could cache the cookies in a file and reuse them instead of logging in every time.

3. Captchas are triggered based on the IP address. I encountered captchas while testing locally, but changing the IP address allowed me to bypass them.

4. After successfully obtaining the necessary cookies, the API endpoints do not pose any banning or captcha challenges.


### Note:
Example output is located inside output.json