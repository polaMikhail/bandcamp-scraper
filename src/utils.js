
calculateWishlistReliability = (wishlistGenres, followedGenres) => {
    const totalItems = wishlistGenres.length;
    const itemsWithFollowedLabel = wishlistGenres.filter((genre) => followedGenres.includes(genre)).length;
    const reliability = itemsWithFollowedLabel / totalItems;
    return parseFloat(reliability.toFixed(2));
  }  

extractObjectValuesByKey = (object, keys) => {
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
getTimeString = () => {
    const date = new Date();
    const timeString = `${date.getTime() / 1000}:${date.getMilliseconds()}`;
    return timeString;
}
module.exports = {
    calculateWishlistReliability,
    extractObjectValuesByKey,
    getTimeString
};