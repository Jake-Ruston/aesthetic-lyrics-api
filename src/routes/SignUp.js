const Endpoint = require('../util/Endpoint');

const Hash = require('../util/Hash');

const bcrypt = require('bcrypt');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/signup' });
  }

  async post(req, res, next) {
    // Obtain the username and password from the body
    let { username, password } = req.body;

    // Error checking
    if (!(username && password)) {
      return next(this.error(res, 400, 'you must supply a username and password', next));
    }

    if (username.length > 20) {
      return next(this.error(res, 400, 'username must be at most 20 characters', next));
    }

    // Check if the username is taken
    try {
      const userExists = await this.db.users.findOne(
        { where: { username } }
      );
      if (userExists) return next(this.error(res, 409, 'username already exists', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Hash the password
    try {
      password = await bcrypt.hash(password, 10);
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Generate a new token
    const token = Hash.generate(username);

    // Create the user
    try {
      await this.db.users.create(
        { username, password, token }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 201, 'user successfully created', next));
  }
};
