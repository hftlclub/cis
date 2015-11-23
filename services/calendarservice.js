var ical = require('ical');
var config = require('../config');

//retrieve ICS file from URL and parse events
exports.retrieveIcs = function(url, callback) {
    rows = [];

    ical.fromURL(url, {}, function(err, data) {
        for (var k in data){
            if (data.hasOwnProperty(k)) {
                var ev = data[k];

                var row = {
                    uid: ev.uid,
                    title: ev.summary,
                    description: ev.description,
                    start: ev.start.getTime(),
                    end: ev.start.getTime(),
                }

                rows.push(row);
            }
        }
        if(!rows.length) return callback(null, false);

        return callback(null, rows);
    });

}
