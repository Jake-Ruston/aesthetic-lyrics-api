const Endpoint = require('../util/Endpoint');

const Song = require('../classes/Song');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists/:artist/albums/:album/songs/:song', auth: ['post', 'delete'] });
  }

  async get(req, res, next) {
    // Obtain the artist, album and song from the request
    let { artist, album, song } = req.params;

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

    // Obtain the song from the database
    try {
      song = await this.db.songs.findOne(
        { where: { name: song, artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
      if (!song) return next(this.error(res, 404, 'song not found', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create an instance of the song
    song = new Song(song);

    return next(this.json(res, 200, song, next));
  }

  async post(req, res, next) {
    // Obtain the artist, album and song from the request
    let { artist, album, song } = req.params;
    // Obtain the lyrics from the body
    let { lyrics = '' } = req.body;
    let user;

    // Obtain the user
    try {
      user = await this.getUser(req);
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next));
    }

    // Error checking
    if (song.length > 50) {
      return next(this.error(res, 400, 'song must be at most 50 characters', next));
    }

    if (lyrics.length > 5000) {
      return next(this.error(res, 400, 'lyrics must be at most 5000 characters', next));
    }

    // Replace spaces in the request with dashes
    song = song.split(' ').join('-');

    // Check if the artist exists
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the album exists
    try {
      album = await this.db.albums.findOne(
        { where: { name: album, artist_id: artist.dataValues.id } }
      );
      if (!album) return next(this.error(res, 404, 'album doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the song exists
    try {
      const songExists = await this.db.songs.findOne(
        { where: { name: song, artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
      if (songExists) return next(this.error(res, 409, 'song already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create the song
    try {
      await this.db.songs.create(
        { name: song, lyrics, user_id: user.id, artist_id: artist.dataValues.id, album_id: album.dataValues.id }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 201, 'song successfully posted', next));
  }

  async delete(req, res, next) {
    // Obtain the artist, album and song from the request
    let { artist, album, song } = req.params;

    // Check if the artist exists
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the album exists
    try {
      album = await this.db.albums.findOne(
        { where: { name: album, artist_id: artist.dataValues.id } }
      );
      if (!album) return next(this.error(res, 404, 'album doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the song exists
    try {
      song = await this.db.songs.findOne(
        { where: { name: song, artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
      if (!song) return next(this.error(res, 404, 'song doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the user is correct
    try {
      const correctUser = await this.checkUser(req, song.dataValues);
      if (!correctUser) return next(this.error(res, 403, 'forbidden request', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Delete the song
    try {
      await this.songs.destroy(
        { where: { name: song.dataValues.name, artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 200, 'song successfully deleted', next));
  }
};
