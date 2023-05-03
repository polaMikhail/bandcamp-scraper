const AbstractScrapingClass = require('../bandcampScraper.js');

describe('TestOneBaseCase', () => {
  describe('process', () => {
    it('should return the expected object when given valid input', async () => {
      const fixture = require('./fixtures/TestOneBaseCase.json');
      const scraper = new AbstractScrapingClass();

      // Create a mock for the getAlbumGenre method
      const mockgetAlbumGenre = jest.fn(() => ['electronic', 'something else ', 'something third']);
      scraper.getAlbumGenre = mockgetAlbumGenre;

      // Act
      const result = await scraper.process(fixture.input);

      // Assert
      expect(result).toEqual(fixture.expected);
    });
  });
});
