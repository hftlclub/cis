var async = require('async');
var config = require('../config');
var calendarservice = require('../services/calendarservice');

exports.listEvents = function (req, res, next) {
    var events = [];
    //go through all ICS files
    async.mapSeries(Object.keys(config.ics), function (key, cb) {

        //retrieve data from ICS
        calendarservice.retrieveIcs(config.ics[key], function (err, rows) {

            //go through all events form ICS file and add calendar key
            rows.map(function (row) {
                row.cal = key;
                events.push(row);
            });

            cb(null, null);
        });
    }, function (err) {
        if (err) console.log(err);
        res.json(events);
    });


}



exports.getUrls = function (req, res, next) {
    res.json(config.ics);
}
