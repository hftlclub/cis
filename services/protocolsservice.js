var pdc = require('pdc');
var moment = require('moment');
var fs = require('fs');
var sanitize = require('sanitize-filename');

var mysql = require('../modules/mysql');
var config = require('../config');
var utils = require('../modules/utils');
var log = require('../modules/log');


exports.get = function(id, callback) {
    if (!id) {
        return callback(new Error('No ID given'));
    }

    var query = 'SELECT * FROM protocols WHERE id = ? LIMIT 1;';

    mysql.conn.query(query, id, function(err, rows, fields) {
        if (err) return callback(err);
        if (!rows[0]) return callback(null, false);

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
        'chairperson',
        'location',
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

        var tplpath = config.abspath + '/templates/protocolspdf/';

        //build text
        var out = [];

        //date
        var date = moment(row.start).format('DD.MM.YYYY');

        out.push('---'); //header begin
        out.push('tplpath: \'' + tplpath + '\'');
        out.push('title: \'Protokoll ' + row.title + '\'');
        out.push('author: ' + row.recorder);
        out.push('chairperson: ' + row.chairperson);
        out.push('location: ' + row.location);
        out.push('date: ' + date);
        out.push('begin: ' + moment(row.start).format('HH:mm') + ' Uhr');
        out.push('end: ' + moment(row.end).format('HH:mm') + ' Uhr');


        //attendants, but show groups only when they have contents
        var attLabel = {
            'members': 'anwesend',
            'later': 'spaeter',
            'applicants': 'anwaerter',
            'guests': 'gaeste'
        }
        for(var key in attendants){
            var value = null;

            if(attendants[key].length){
                value = attendants[key].join(', ');
            }else{
                value = 'keine';
            }
            out.push(attLabel[key] + ': ' + value);
        }

        //comment, if set
        if(row.comment){
            out.push('kommentar: ' + row.comment);
        }

        out.push('...'); //header end

        //protocol text
        out.push(row.text);

        var outmd = out.join('\n')

        //make filename
        var filenamePart = moment(row.start).format('YYYY-MM-DD') + '-protokoll_' + row.title;
        filenamePart = filenamePart.replace(' ', '-');
        filenamePart = filenamePart.toLowerCase();
        filenamePart = sanitize(filenamePart);

        let filenames = {
            pdf: filenamePart + '.pdf',
            md: filenamePart + '.md'
        }

        let locationPart = path + utils.uid(20);
        let locations = {
            pdf: locationPart + '.pdf',
            md: locationPart + '.md'
        }

        // args for pandoc process
        var args = [
            '--template=' + tplpath + 'clubtemplate.tex',
            '--output=' + locations.pdf
        ]

        // run pandoc to create PDF
        pdc(outmd, 'markdown', 'latex', args, function(err, result){
            log.debug('Created PDF for protocol ', id);
            if(err) return callback(err);
            if(result) log.debug(result);

            // write markdown to file
            fs.writeFile(locations.md, outmd, function(err) {
                if(err) return callback(err);                
                callback(null, locations, filenames);
            });
        });
    })
}
