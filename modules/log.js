var log = require('simple-node-logger').createSimpleLogger({
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
});

log.setLevel('debug');


module.exports = log;
