var mysql = require('../modules/mysql');
var config = require('../config');
var utils = require('../modules/utils');



exports.get = function(id, callback) {
    if (!id) {
        return callback(new Error('No ID given'));
    }

    var query = 'SELECT * FROM protocols WHERE id = ? LIMIT 1;';

    mysql.conn.query(query, id, function(err, rows, fields) {
        if (err) {
            return callback(err);
        }

        if (!rows[0]) {
            return callback(null, false);
        }

        //make JS object from JSON
        rows[0].attendants = JSON.parse(rows[0].attendants);


        return callback(null, rows[0]);
    });
}






exports.add = function(data, callback) {

    //allowed attributes
    var attrs = [
        'title',
        'recorder',
        'start',
        'end',
        'attendants',
        'text',
        'comment'
    ];

    var add = {};
    for (var key in data) {
        //check whether attribute is allowed to add
        if (!attrs.indexOf(key) < 0) continue;

        //insert add key
        add[key] = data[key];
    }


    //error if there are no attributes left
    if (!Object.keys(add).length) {
        return callback(new Error('No attributes to add'));
    }

    //make JSON from JS object
    add.attendants = JSON.stringify(add.attendants);


    //add new ID
    add.id = utils.uid(32);


    //build query
    var query = 'INSERT INTO protocols SET ?;';

    mysql.conn.query(query, add, function(err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, add.id);
    });
}





exports.edit = function(id, data, callback) {

    //allowed attributes
    var attrs = [
        'title',
        'recorder',
        'start',
        'end',
        'attendants',
        'text',
        'comment'
    ];

    var change = {};
    for (var key in data) {
        //check whether attribute is allowed to change
        if (!attrs.indexOf(key) < 0) continue;

        //insert add key
        change[key] = data[key];
    }


    //error if there are no attributes left
    if (!Object.keys(change).length) {
        return callback(new Error('No attributes to change'));
    }

    //make JSON from JS object
    change.attendants = JSON.stringify(change.attendants);




    //build query
    var query = 'UPDATE protocols SET ? WHERE id = ?;';

    mysql.conn.query(query, [change, id], function(err, result) {
        if (err) {
            return callback(err);
        }

        return callback();
    });
}









exports.list = function(reduced, callback) {
    //supply a reduced set of fields if just an overview is needed
    if (reduced) {
        var fields = 'id, start AS date, title, comment';
    } else {
        fields = '*';
    }

    var query = 'SELECT ' + fields + ' FROM protocols ORDER BY start DESC;';

    mysql.conn.query(query, function(err, rows, fields) {
        if (err) {
            return callback(err);
        }

        if (!rows.length) {
            return callback(null, false);
        }

        return callback(null, rows);
    });
}






exports.del = function(id, callback) {
    var query = 'DELETE FROM protocols WHERE id = ?;';

    mysql.conn.query(query, id, function(err, result) {
        if (err) {
            return callback(err);
        }

        return callback();
    });
}
