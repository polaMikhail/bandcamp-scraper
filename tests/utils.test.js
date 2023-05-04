const {calculateWishlistReliability, extractObjectValuesByKey} = require('../src/utils.js');

  describe('calculateWishlistReliability', () => {
    it('calculates the correct reliability when there are no matching genres', () => {
      const wishlistGenres = [1, 2, 3, 4];
      const followedGenres = [5, 6, 7];
      const reliability = calculateWishlistReliability(wishlistGenres, followedGenres);
      expect(reliability).toBe(0);
    });

    it('calculates the correct reliability when all wishlist genres are followed', () => {
      const wishlistGenres = [1, 2, 3, 4];
      const followedGenres = [1, 2, 3, 4];
      const reliability = calculateWishlistReliability(wishlistGenres, followedGenres);
      expect(reliability).toBe(1);
    });

    it('calculates the correct reliability when some wishlist genres are followed', () => {
      const wishlistGenres = [1, 2, 3, 4];
      const followedGenres = [2, 4];
      const reliability = calculateWishlistReliability(wishlistGenres, followedGenres);
      expect(reliability).toBe(0.5);
    });

    it('calculates the correct reliability when wishlist and followed genres have no common genres', () => {
      const wishlistGenres = [1, 2, 3, 4];
      const followedGenres = [5, 6, 7, 8];
      const reliability = calculateWishlistReliability(wishlistGenres, followedGenres);
      expect(reliability).toBe(0.00);
    });
  });

  describe('extractObjectValuesByKey function', () => {
    const obj = {
      1: { name: 'genre1', tag_page_url: 'url1', genre_id: 1 },
      2: { name: 'genre2', genre_id: 2 },
      3: { tag_page_url: 'url3', genre_id: 3 },
      4: { name: 'genre4', tag_page_url: 'url4' },
      5: { genre_id: 5 },
      6: { name: 'genre6', tag_page_url: 'url6', genre_id: 6 },
    };
  
    it('should return an array of objects with the specified keys', () => {
      const expected = [
        { name: 'genre1', tag_page_url: 'url1', genre_id: 1 },
        { name: 'genre2', genre_id: 2 },
        { tag_page_url: 'url3', genre_id: 3 },
        { name: 'genre4', tag_page_url: 'url4' },
        { genre_id: 5 },
        { name: 'genre6', tag_page_url: 'url6', genre_id: 6 },
      ];
      const actual = extractObjectValuesByKey(obj, ['name', 'tag_page_url', 'genre_id']);
      expect(actual).toEqual(expected);
    });
  
    it('should return an empty array if the object is empty', () => {
      const actual = extractObjectValuesByKey({}, ['name', 'tag_page_url', 'genre_id']);
      expect(actual).toEqual([]);
    });
  
    it('should return an empty array if no objects contain the specified keys', () => {
      const actual = extractObjectValuesByKey(obj, ['foo', 'bar']);
      expect(actual).toEqual([]);
    });
  });

  
  