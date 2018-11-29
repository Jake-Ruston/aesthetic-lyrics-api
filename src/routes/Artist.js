const Endpoint = require('../util/Endpoint');

const Artist = require('../classes/Artist');
const Album = require('../classes/Album');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/artists/:artist', auth: ['post', 'delete', 'patch'] });
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

    // Create an instance of the artist with their albums
    artist = new Artist(artist, albums);

    return next(this.json(res, 200, artist, next));
  }

  async post(req, res, next) {
    // Obtain the artist from the request
    let { artist } = req.params;
    let user;

    // Obtain the user
    try {
      user = await this.getUser(req);
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next));
    }

    // Error checking
    if (artist.length > 50) {
      return next(this.error(res, 400, 'artist must be at most 50 characters', next));
    }

    // Replace spaces in the request with dashes
    artist = artist.split(' ').join('-');

    // Check if the artist exists
    try {
      const artistExists = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (artistExists) return next(this.error(res, 409, 'artist already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Create the artist
    try {
      await this.db.artists.create(
        { name: artist, user_id: user.id }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 201, 'artist successfully posted', next));
  }

  async delete(req, res, next) {
    // Obtain the artist from the request
    let { artist } = req.params;
    let album, song;

    // Check if the artist exists
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the user is correct
    try {
      const correctUser = await this.checkUser(req, artist.dataValues);
      if (!correctUser) return next(this.error(res, 403, 'forbidden request', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the artist has albums
    try {
      album = await this.db.albums.findOne(
        { where: { artist_id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the artist has songs
    try {
      song = await this.db.songs.findOne(
        { where: { artist_id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    if (album || song) return next(this.error(res, 403, 'artist still has songs/albums', next));

    // Delete the artist
    try {
      await this.db.artists.destroy(
        { where: { name: artist.dataValues.name } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 200, 'artist successfully deleted', next));
  }

  async patch(req, res, next) {
    // Obtain the artist from the request
    let { artist } = req.params;
    // Obtain the new artist from the body
    let { artist: newArtist = artist } = req.body;

    // Error checking
    if (artist === newArtist) return next(this.error(res, 400, 'you must provide a new artist', next));

    if (newArtist.length > 50) {
      return next(this.error(res, 400, 'artist must be at most 50 characters', next));
    }

    // Replace spacesin the request with dashes
    newArtist = newArtist.split(' ').join('-');

    // Check if the artist exists
    try {
      artist = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (!artist) return next(this.error(res, 404, 'artist doesn\'t exist', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the user is correct
    try {
      const correctUser = await this.checkUser(req, artist.dataValues);
      if (!correctUser) return next(this.error(res, 403, 'forbidden request', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Check if the new artist exists
    try {
      const newArtistExists = await this.db.artists.findOne(
        { where: { name: artist } }
      );
      if (newArtistExists) return next(this.error(res, 409, 'new artist already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Update the artist
    try {
      await this.db.artists.update(
        { name: newArtist },
        { where: { id: artist.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next));
    }

    return next(this.success(res, 200, 'artist successfully patched', next));
  }
};
