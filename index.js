const restify = require('restify');

const Server = require('./src/Server');
const Logger = require('./src/util/Logger');

const server = new Server(restify);

server.listen(8080, () => Logger.log(null, 'Server running'));

process.on('unhandledRejection', console.warn);
