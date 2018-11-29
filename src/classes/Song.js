/**
 * Represents a song.
 * @class
 */
module.exports = class {
  /**
   * @param {Object} song The song object
   */
  constructor(song) {
    this.name = song.name;
    this.lyrics = song.lyrics;
    this.created = song.created_at;
    this.updated = song.updated_at;
  }
};
