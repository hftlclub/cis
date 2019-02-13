var ical = require('ical');
var config = require('../config');

//retrieve ICS file from URL and parse events
exports.retrieveIcs = function(url, callback) {
    rows = [];

    ical.fromURL(url, {}, function(err, data) {
        if(err) return callback(err);

        for (var k in data){
            if (data.hasOwnProperty(k)) {
                var ev = data[k];

                var row = {
                    uid: ev.uid,
                    title: ev.summary,
                    start: ev.start && ev.start.getTime(),
                    end: ev.end && ev.end.getTime(),
                }

                if(ev.description) row.description = ev.description;

                rows.push(row);
            }
        }

        return callback(null, rows);
    });

}
