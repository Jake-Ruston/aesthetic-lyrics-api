const Logger = require('./util/Logger');

const path = require('path');
const util = require('util');
const fs = require('fs');

/**
 * The main hub - to be instantiated on start.
 * @class
 */
module.exports = class {
  /**
   * @param {Object} restify The restify framework
   */
  constructor(restify) {
    this.server = restify.createServer();

    // Plugins
    this.server.use(restify.plugins.bodyParser({ requestBodyOnGet: true }));
    this.server.use(restify.plugins.queryParser({ mapParams: false }));
    this.server.use(restify.plugins.throttle({
      burst: 10, rate: 2, ip: true
    }));

    this.server.pre(restify.plugins.pre.sanitizePath());
  }

  async auth(req, res, next) {
    const db = require('./util/Database');

    // Obtain the token from the headers
    const [, token] = req.header('authorization').split(' ');

    // Check if the token is valid
    try {
      const user = await db.users.findOne(
        { where: { token } }
      );
      if (user) return next();
    } catch (err) {
      res.set({ 'Content-Type': 'application/json' });

      Logger.log('error', err);
      return next(res.send(500, { code: 500, message: 'internal server error' }));
    }

    res.set({ 'Content-Type': 'application/json' });

    return next(res.send(401, { code: 401, message: 'invalid token' }));
  }

  next(req, res, next) {
    return next();
  }

  /**
   * Gets the server up and listening.
   *
   * @param {number} port The port to listen on
   * @param {Function} fn A callback function to fire once the server is listening
   */
  async listen(port, fn) {
    this.server.listen(port, fn());

    const dir = path.join(__dirname, 'routes');
    const files = await util.promisify(fs.readdir)(dir);

    files.forEach(file => {
      file = path.join(dir, file);
      const route = new (require(file));

      /* eslint-disable max-len */
      this.server.get(route.path, route.auth.includes('get') ? this.auth : this.next, (req, res, next) => route.get(req, res, next));
      this.server.post(route.path, route.auth.includes('post') ? this.auth : this.next, (req, res, next) => route.post(req, res, next));
      this.server.del(route.path, route.auth.includes('delete') ? this.auth : this.next, (req, res, next) => route.delete(req, res, next));
      this.server.patch(route.path, route.auth.includes('patch') ? this.auth : this.next, (req, res, next) => route.patch(req, res, next));
      /* eslint-enable max-len */
    });
  }
};
