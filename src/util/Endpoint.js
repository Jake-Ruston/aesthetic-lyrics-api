const Base = require('./Base');

/**
 * Represents the base point of each endpoint.
 * @class
 * @extends {Base}
 */
module.exports = class extends Base {
  /**
   * @param {Object} [options = {}] The options of the endpoint
   * @param {string} options.path The path of the endpoint
   * @param {Array<string>} [options.auth = []] The methods that require authentication
   */
  constructor(options = {}) {
    super();

    this.path = options.path;
    this.auth = options.auth || [];

    this.db = require('./Database');

    if (!this.path) throw new Error('You must supply a path');
    if (typeof this.path !== 'string') throw new TypeError('Path must be of type string');
    if (!Array.isArray(this.auth)) throw new TypeError('Auth must be of type array');
  }

  get(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method GET not allowed' }, next));
  }

  head(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method HEAD not allowed' }, next));
  }

  post(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method POST not allowed' }, next));
  }

  put(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method PUT not allowed' }, next));
  }

  delete(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method DELETE not allowed' }, next));
  }

  connect(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method CONNECT not allowed' }, next));
  }

  options(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method OPTIONS not allowed' }, next));
  }

  trace(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method TRACE not allowed' }, next));
  }

  patch(req, res, next) {
    return next(this.json(res, 405, { code: 405, message: 'method PATCH not allowed' }, next));
  }

  async getUser(req) {
    // Obtain the token from the headers
    const [, token] = req.header('authorization').split(' ');

    const user = await this.db.users.findOne(
      { where: { token } }
    );

    return user.dataValues;
  }

  /**
   * Checks whether the user attempting the request is correct.
   *
   * @param {Object} req The request object
   * @param {Object} obj The object with the user id
   */
  async checkUser(req, obj) {
    // Obtain the token from the headers
    const [, token] = req.header('authorization').split(' ');

    // Obtain the user from the database
    const user = await this.db.users.findOne(
      { where: { id: obj.user_id } }
    );

    // Return a boolean depending on whether the tokens match
    return user.dataValues.token === token;
  }
};
