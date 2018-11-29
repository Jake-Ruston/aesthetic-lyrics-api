const Endpoint = require('../util/Endpoint');

const Hash = require('../util/Hash');

const bcrypt = require('bcrypt');

module.exports = class extends Endpoint {
  constructor() {
    super({ path: '/auth' });
  }

  async get(req, res, next) {
    // Obtain the username and password from the body
    const { username, password } = req.body;

    // Error checking
    if (!(username && password)) {
      return next(this.error(res, 400, 'you must supply a username and password', next));
    }

    let user;

    // Fetch the user
    try {
      user = await this.db.users.findOne(
        { where: { username } }
      );
      if (!user) return next(this.error(res, 404, 'invalid login credentials', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Compare the users password
    try {
      const passwordsMatch = await bcrypt.compare(
        password, user.dataValues.password
      );
      if (!passwordsMatch) return next(this.error(res, 404, 'invalid login credentials', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', err, next));
    }

    return next(this.success(res, 200, user.dataValues.token, next));
  }

  async post(req, res, next) {
    // Obtain the username and password from the body
    const { username, password } = req.body;

    // Error checking
    if (!(username && password)) {
      return next(this.error(res, 400, 'you must supply a username and password', next));
    }

    let user;

    // Fetch the user
    try {
      user = await this.db.users.findOne(
        { where: { username } }
      );
      if (!user) return next(this.error(res, 404, 'invalid login credentials', next));
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    // Generate a new token
    const token = Hash.generate(user.dataValues.username);

    // Update the token
    try {
      await this.db.users.update(
        { token },
        { where: { id: user.dataValues.id } }
      );
    } catch (err) {
      return next(this.error(res, 500, 'internal server error', next, err));
    }

    return next(this.success(res, 200, token, next));
  }
};
