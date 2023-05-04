const BASE_URL = 'https://bandcamp.com';
const CONFIG_MAP = {
    followingBands: {
        url: `${BASE_URL}/api/fancollection/1/following_bands`,
        fieldsToExtract: ['name', 'band_url']
    },
    followingGenres: {
        url: `${BASE_URL}/api/fancollection/1/following_genres`,
        fieldsToExtract: ['name', 'tag_page_url', 'genre_id']
    },
    wishlist: {
        url: `${BASE_URL}/api/fancollection/1/wishlist_items`,
        fieldsToExtract: ['item_title', 'item_url', 'genre_id', 'item_type']
    },
    collection: {
        url: `${BASE_URL}/api/fancollection/1/collection_items`,
        fieldsToExtract: ['item_title', 'item_url', 'band_name', 'band_url']
    }
};

module.exports = CONFIG_MAP 