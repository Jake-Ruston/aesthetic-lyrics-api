const Logger = require('./Logger');

/**
 * Provides useful methods for the response object.
 * @class
 */
module.exports = class {
  json(res, code, data, next) {
    res.set({ 'Content-Type': 'application/json' });

    return next(res.send(code, data));
  }

  success(res, code, data, next) {
    return next(this.json(res, code, { code, message: data }, next));
  }

  error(res, code, data, next, err) {
    if (err) Logger.log('error', err);

    return next(this.json(res, code, { code, message: data }, next));
  }
};
