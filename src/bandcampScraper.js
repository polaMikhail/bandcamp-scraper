const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const axios = require('axios');

class AbstractScrapingClass {

    calculateWishlistReliability(wishlistGenres, followedGenres) {
        const totalItems = wishlistGenres.length;
        const itemsWithFollowedLabel = wishlistGenres.filter((genre) => followedGenres.includes(genre)).length;
        return itemsWithFollowedLabel / totalItems;
    }

    async getAlbumGenre(urls) {
        const promises = urls.map((url) => axios.get(url));
        const responses = await Promise.all(promises);
        // iterate over responses and extract data
        const data = responses.map((response) => {
            const $ = cheerio.load(response.data);
            // extract ld+json and parse it
            const ldJson = $('script[type="application/ld+json"]').html();
            const parsedLdJson = JSON.parse(ldJson);
            // extract genre
            const genre = parsedLdJson.publisher.genre;
            return genre.split('/').pop();

        });
        return data;
    }

    extractObjectValuesByKey(object, keys) {
        const extractedValues = [];
        for (const key in object) {
            const values = {};
            keys.forEach((objKey) => {
                if (object[key]?.[objKey] !== undefined) {
                    values[objKey] = object[key][objKey];
                }
            });
            if (Object.keys(values).length !== 0) {
                extractedValues.push(values);
            }
        }
        return extractedValues;
    }

    async getCredentials(filePath) {
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

    // write a function that takes a javascript object and writes it to a file
    async writeToFile(data) {
        const filename = '/app/data.json';

        fs.writeFile(filename, JSON.stringify(data), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Data written to ${filename} successfully!`);
        });
    }

    async login() {
        const { username, password } = await this.getCredentials(process.argv[2]);
        // create puppeteer browser instance with headless mode set to false and no sandbox
        const browser = await puppeteer.launch({
            headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'],
            env: {
                DISPLAY: ':99',
            },
        });
        const page = await browser.newPage();

        await page.goto('https://bandcamp.com/login');

        // Fill in the login form
        await page.type('#username-field', username);
        await page.type('#password-field', password);

        // Click the login button
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation(),
        ]);

        // Extract $pagedata
        const dataBlob = await page.$eval('#pagedata', el => JSON.parse(el.getAttribute('data-blob')));
        await browser.close();

        return dataBlob;
    }

    async process(dataBlob) {
        const genres = this.extractObjectValuesByKey(dataBlob.item_cache.following_genres, ['display_name', 'tag_page_url']);
        const wishlist = this.extractObjectValuesByKey(dataBlob.item_cache.wishlist, ['item_title', 'item_url'])
        const ItemsGenre = await this.getAlbumGenre(wishlist.map(item => item.item_url));
        return {
            "followed_genres": genres,
            "following_bands": this.extractObjectValuesByKey(dataBlob.item_cache.following_bands, ['name']),
            "wishlist": wishlist,
            "reliability": this.calculateWishlistReliability(ItemsGenre, genres.map(genre => genre.tag_page_url.split('/').pop()))
        };
    }

}

async function run() {
    const scraper = new AbstractScrapingClass();
    const dataBlob = await scraper.login();
    const resutl = await scraper.process(dataBlob);
    scraper.writeToFile(resutl);

}

if (require.main === module) {
    run();
}
module.exports = AbstractScrapingClass;