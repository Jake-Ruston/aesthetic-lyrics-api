const Endpoint = require('../util/Endpoint');

const Artist = require('../classes/Artist');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists' });
  }

  async get(req, res, next) {
    let artists;
    // Obtain the artists from the database
    try {
      artists = await this.db.artists.findAll();
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create an instance of each artist in the array
    artists = artists.map(artist => new Artist(artist));

    return next(this.json(res, 200, artists, next));
  }
};
