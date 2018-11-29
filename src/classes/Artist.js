/**
 * Represents an artist.
 * @class
 */
module.exports = class {
  /**
   * @param {Object} artist The artist object
   * @param {Array<Object|null>} [albums = []] An array of the artist's albums
   */
  constructor(artist, albums = []) {
    this.name = artist.name;
    this.albums = albums;
    this.created = artist.created_at;
    this.updated = artist.updated_at;
  }
};
