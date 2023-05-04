const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const axios = require('axios');
const { calculateWishlistReliability, extractObjectValuesByKey, getTimeString } = require('./utils.js');
const CONFIG_MAP = require('../config/config.js');

class AbstractScrapingClass {

    getCredentials = async (filePath) => {
        if (!filePath) {
            console.error('Please provide a JSON file path.');
            process.exit(1);
        }
        let credentials;
        try {
            credentials = await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error(`Failed to read file at ${filePath}`);
            process.exit(1);
        }
        let { username, password } = JSON.parse(credentials);

        if (!username || !password) {
            console.error('Please provide a valid username and password.');
            process.exit(1);
        }

        return { username, password };
    }

    writeToFile = async (data) => {
        const filename = 'output.json';

        try {
            await fs.writeFile(filename, JSON.stringify(data));
            console.log(`Data written to ${filename} successfully!`);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    };

    login = async () => {
        try {
            const { username, password } = await this.getCredentials(process.argv[2]);

            const browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito'],
            });

            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(60000); // Set a timeout of 60 seconds for navigation

            await page.goto('https://bandcamp.com/login');

            // Wait for the login form elements to appear
            await Promise.all([
                page.waitForSelector('#username-field'),
                page.waitForSelector('#password-field'),
                page.waitForSelector('button[type="submit"]'),
            ]);

            // Fill in the login form
            await page.type('#username-field', username);
            await page.type('#password-field', password);

            // Click the login button and wait for navigation to complete
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation(),
            ]);

            // Check if the login was successful by looking for the pagedata element
            await page.waitForSelector('#pagedata', { timeout: 10000 }); // Set a timeout of 10 seconds for the pagedata element to appear
            const dataBlob = await page.$eval('#pagedata', (el) => JSON.parse(el.getAttribute('data-blob')));

            // Extract the cookies
            const cookies = await page.cookies();

            await browser.close();

            return { cookies, dataBlob };
        } catch (error) {
            console.error('Error occurred during login:', error);
            throw error; // Rethrow the error to the caller
        }
    }


    getApiData = async (config, body, cookies, key, data = []) => {
        // Destructure the config object to get the API URL and fields to extract
        const { url, fieldsToExtract } = config;

        // Set up the request headers, including the cookies
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
        };

        try {
            // Make the API request using Axios
            const response = await axios.post(url, body, { headers });

            // If the API request fails, throw an error
            if (response.status !== 200) {
                throw new Error(`Failed to fetch data from ${url}`);
            }

            // Extract the last_token and more_available fields from the API response
            const { last_token, more_available } = response.data;

            // Extract the desired data fields from the API response object and append to the data array
            data = [...data, ...extractObjectValuesByKey(response.data[key], fieldsToExtract)];

            // If there is more data available, make a recursive call to get the next page of data
            if (more_available) {
                const nextBody = { ...body, older_than_token: last_token };
                const nextData = await this.getApiData(config, nextBody, cookies, key, data);
                return nextData;
            }

            // If there is no more data available, return the accumulated data array
            return data;

        } catch (error) {
            // If there is an error, log a message and exit the process with an error code
            console.error(`Error fetching data from ${url}: ${error.message}`);
            process.exit(1);
        }
    }


    process = async (cookies, dataBlob) => {

        // Extract the fan ID from the data blob
        const fanID = dataBlob.fan_stats.fan_id;

        // Construct the API request body
        const body = { fan_id: fanID, older_than_token: `${getTimeString()}:a::`, count: 20 }

        // Define the endpoint configurations to fetch data from
        const endpointConfigs = [
            { config: CONFIG_MAP.wishlist, body, resultKey: 'items' },
            { config: CONFIG_MAP.followingGenres, body, resultKey: 'followeers' },
            { config: CONFIG_MAP.followingBands, body, resultKey: 'followeers' },
            { config: CONFIG_MAP.collection, body, resultKey: 'items' }
        ];

        // Fetch data from each endpoint in parallel
        const endpointPromises = endpointConfigs.map(({ config, body, resultKey }) => {
            return this.getApiData(config, body, cookies, resultKey);
        });
        const [wishlist, genres, bands, collection] = await Promise.all(endpointPromises);

        // Calculate the reliability of the wishlist
        const reliability = calculateWishlistReliability(
            wishlist.map(wishlistItem => wishlistItem.genre_id),
            genres.map(genre => genre.genre_id)
        );

        // Return the extracted data and reliability score
        return {
            followed: {
                genres,
                bands,
            },
            wishlist,
            collection,
            reliability
        };
    }


}

run = async () => {
    const scraper = new AbstractScrapingClass();
    const { cookies, dataBlob } = await scraper.login();
    const result = await scraper.process(cookies, dataBlob);
    scraper.writeToFile(result);
}

if (require.main === module) {
    run();
}
module.exports = AbstractScrapingClass;