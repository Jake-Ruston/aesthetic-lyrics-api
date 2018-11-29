const Endpoint = require('../util/Endpoint');

const Song = require('../classes/Song');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists/:artist/albums/:album/songs' });
  }

  async get(req, res, next) {
    // Obtain the artist and album from the request
    let { artist, album } = req.params;
    let songs;

    // Obtain the artist from the database
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist not found', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Obtain the album from the database
    try {
      album = await this.db.albums.findOne(
        { where: { name: album, artist_id: artist.dataValues.id } }
      );
      if (!album) return next(this.error(res, 404, 'album not found', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Obtain the songs from the database
    try {
      songs = await this.db.songs.findAll(
        { where: { artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create an instance of each song in the array
    songs = songs.map(song => new Song(song));

    return next(this.json(res, 200, songs, next));
  }
};
