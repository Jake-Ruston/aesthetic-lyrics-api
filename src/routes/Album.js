const Endpoint = require('../util/Endpoint');

const Album = require('../classes/Album');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists/:artist/albums/:album', auth: ['post', 'delete', 'patch'] });
  }

  async get(req, res, next) {
    // Obtain the artist and album from the request
    let { artist, album } = req.params;

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
      album = this.db.albums.findOne(
        { where: { name: album, artist_id: artist.dataValues.id } }
      );
      if (!album) return next(this.error(res, 404, 'album not found', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create an instance of the album
    album = new Album(album);

    return next(this.json(res, 200, album, next));
  }

  async post(req, res, next) {
    // Obtain the artist and album from the request
    let { artist, album } = req.params;
    let user;

    // Obtain the user
    try {
      user = await this.getUser(req);
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next));
    }

    // Error checking
    if (album.length > 50) {
      return next(this.error(res, 400, 'album must be at most 50 characters', next));
    }

    // Replace spaces in the request with dashes
    album = album.split(' ').join('-');

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
      const albumExists = await this.db.albums.findOne(
        { where: { name: album, artist_id: artist.dataValues.id } }
      );
      if (albumExists) return next(this.error(res, 409, 'album already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create the album
    try {
      await this.db.albums.create(
        { name: album, user_id: user.id, artist_id: artist.dataValues.id }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 201, 'album successfully posted', next));
  }

  async delete(req, res, next) {
    // Obtain the artist and album from the request
    let { artist, album } = req.params;
    let song;

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

    // Check if the user is correct
    try {
      const correctUser = await this.checkUser(req, album.dataValues);
      if (!correctUser) return next(this.error(res, 403, 'forbidden request', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the album has songs
    try {
      song = await this.db.songs.findOne(
        { where: { artist_id: artist.dataValues.id, album_id: album.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    if (song) return next(this.error(res, 403, 'album still has songs', next));

    // Delete the album
    try {
      await this.db.albums.destroy(
        { where: { name: album.dataValues.name, artist_id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 200, 'album successfully deleted', next));
  }

  async patch(req, res, next) {
    // Obtain the artist and album from the request
    let { artist, album } = req.params;
    // Obtain the new album from the body
    let { album: newAlbum = album } = req.params;

    // Error checking
    if (album === newAlbum) return next(this.error(res, 400, 'you must provide a new album', next));

    if (newAlbum.length > 50) {
      return next(this.error(res, 400, 'album must be at most 50 characters', next));
    }

    // Replace spaces in the request with dashes
    newAlbum = newAlbum.split(' ').join('-');

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

    // Check if the user is correct
    try {
      const correctUser = await this.checkUser(req, album.dataValues);
      if (!correctUser) return next(this.error(res, 403, 'forbidden request', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the new album exists
    try {
      const newAlbumExists = await this.db.albums.findOne(
        { where: { name: newAlbum, artist_id: artist.dataValues.id } }
      );
      if (newAlbumExists) return next(this.error(res, 409, 'new album already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Update the album
    try {
      await this.db.albums.update(
        { name: newAlbum },
        { where: { id: album.dataValues.id, artist_id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 200, 'album successfully patched', next));
  }
};
