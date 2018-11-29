const chalk = require('chalk');

/**
 * Helper class to log messages.
 * @class
 */
module.exports = class {
  /**
   * Logs a message to the console
   *
   * @param {string} type The type of message to be logged
   * @param {string} message The message to to be logged
   * @return {void}
   */
  static log(type, message) {
    const date = new Date().toLocaleString();

    if (type === 'error') return console.log(chalk.bold.bgRed(`[${date}] ${message}`));
    return console.log(chalk.bold.bgBlue(`[${date}] ${message}`));
  }
};
