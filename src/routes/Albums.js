const Endpoint = require('../util/Endpoint');

const Album = require('../classes/Album');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists/:artist/albums' });
  }

  async get(req, res, next) {
    // Obtain the artist from the request
    let { artist } = req.params;
    let albums;

    // Obtain the artist from the database
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist not found', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Obtain the albums from the database
    try {
      albums = await this.db.albums.findAll(
        { where: { artist_id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create an instance of each album in the array
    albums = albums.map(album => new Album(album));

    return next(this.json(res, 200, albums, next));
  }
};
