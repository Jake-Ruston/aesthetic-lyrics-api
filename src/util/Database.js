const Sequelize = require('sequelize');

const { username, password, host, database, dialect } = require('../../config');

/**
 * Represents a database.
 * @class
 */
module.exports = new class {
  constructor() {
    // Connect to the database
    this.database = new Sequelize(database, username, password, {
      host, dialect, logging: false, operatorsAliases: false
    });

    // Import models
    this.users = this.database.import('../models/users');
    this.songs = this.database.import('../models/songs');
    this.albums = this.database.import('../models/albums');
    this.artists = this.database.import('../models/artists');
  }
};
