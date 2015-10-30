var markdownpdf = require('markdown-pdf');
var moment = require('moment');
var sanitize = require('sanitize-filename');

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




exports.makePdf = function(id, path, callback){
    //get protocol
    exports.get(id, function(err, row){
        //break if error occured or return value empty
        if(err || !row){
            return callback(new Error('Unknown ID'));
        }

        //group attendants
        var attendants = {
            'members': [],
            'later': [],
            'applicants': [],
            'guests': []
        };

        for (var i = 0; i < row.attendants.length; i++) { //go through attendants and put them into groups
            var att = row.attendants[i];

            if (att.later) {
                att.name += ' (' + moment(att.later).format('HH:mm') + ' Uhr)';

                //push later members to "later" list, applicants and guests stay in their own list, even if delayed
                if(att.type == 'member'){
                    attendants.later.push(att.name);
                    continue;
                }
            }

            if (att.type == 'member') {
                attendants.members.push(att.name);
                continue;
            }

            if (att.type == 'applicant') {
                attendants.applicants.push(att.name);
                continue;
            }

            if (att.type == 'guest') {
                attendants.guests.push(att.name);
                continue;
            }
        }


        //build text
        var out = [];

        //date
        var date = moment(row.start).format('DD.MM.YYYY');

        //headline
        out.push('# ' + row.title + ' ' + date);

        //separator line
        out.push('---');

        //dates
        out.push('**Datum:** ' + date);
        out.push('**Start:** ' + moment(row.start).format('HH:mm') + ' Uhr');
        out.push('**Ende:** ' + moment(row.end).format('HH:mm') + ' Uhr');

        //recorder
        out.push('**Protokollführer:** ' + row.recorder);

        out.push('\n');

        //attendants, but show groups only when they have contents
        var attLabel = {
            'members': 'Teilnehmer',
            'later': 'Später',
            'applicants': 'Anwärter',
            'guests': 'Gäste'
        }
        for(var key in attendants){
            if(attendants[key].length){
                out.push('**' + attLabel[key] + '**: ' + attendants[key].join(', '));
            }
        }


        //comment, if set
        if(row.comment){
            out.push('\n');
            out.push('**Kommentar:** ' + row.comment);
        }

        //separator line
        out.push('---');

        //protocol text
        out.push(row.text);

        var outmd = out.join('\n\n')

        //make filename
        var filename = moment(row.start).format('YYYY-MM-DD') + '-protokoll_' + row.title + '.pdf';
        filename = filename.replace(' ', '-');
        filename = filename.toLowerCase();

        filename = sanitize(filename);

        var location = '/tmp/' + utils.uid(20) + '.pdf';

        markdownpdf().from.string(outmd).to(location, function() {
            console.log('Created PDF for protocol', id);
            callback(null, location, filename);
        })

    })
}
