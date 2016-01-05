var mysql = require('mysql');
var config = require('../config');


function handleDBError() {
    exports.conn = mysql.createConnection(config.dbcred);

    exports.conn.connect(function(err) {
        if (err) {
            console.log(new Date(), ': Error connecting to MySQL database:', err);
            setTimeout(handleDBError, 2000);
        }
    });

    exports.conn.on('error', function(err) {
        console.log(new Date(), ': MySQL database error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDBError();
        } else {
            throw err;
        }
    });
}
handleDBError();
