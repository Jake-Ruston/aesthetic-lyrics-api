/**
 * Represents an album.
 * @class
 */
module.exports = class {
  /**
   * @param {Object} album The album object
   * @param {Array<Object>} [songs = []] An array of the album's songs
   */
  constructor(album, songs = []) {
    this.name = album.name;
    this.songs = songs;
    this.created = album.created_at;
    this.updated = album.updated_at;
  }
};
