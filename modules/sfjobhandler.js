var mysql = require('../modules/mysql');
var config = require('../config');

module.exports.addJob = function(action, params, callback){
    var values = {
        action: action,
        params: JSON.stringify(params)
    };

    var query = 'INSERT INTO sfjobs SET ?';

    mysql.conn.query(query, values, function(err, result) {
        if (err) {
            return callback(err);
        }

        return callback();
    });
}
