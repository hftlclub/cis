var async = require('async');
var config = require('../config');
var calendarservice = require('../services/calendarservice');

exports.listEvents = function (req, res, next) {
    var events = [];
    async.mapSeries(Object.keys(config.ics), function (key, cb) {

        calendarservice.retrieveIcs(config.ics[key], function (err, rows) {
            var cal = { 'name': key, 'events': rows };
            events.push(cal);
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
