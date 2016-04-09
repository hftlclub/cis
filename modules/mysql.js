var mysql = require('mysql');
var config = require('../config');
var log = require('../modules/log');

function handleDBError() {
    exports.conn = mysql.createConnection(config.dbcred);

    exports.conn.connect(function(err) {
        if (err) {
            log.error('Error connecting to MySQL database:', err);
            setTimeout(handleDBError, 2000);
        }
    });

    exports.conn.on('error', function(err) {
        log.error('MySQL database error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDBError();
        } else {
            throw err;
        }
    });
}
handleDBError();
