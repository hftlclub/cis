var async = require('async');
var config = require('../config');
var calendarservice = require('../services/calendarservice');
var log = require('../modules/log');

exports.listEvents = function (req, res, next) {
    var events = {};

    //go through all ICS files
    async.mapSeries(Object.keys(config.ics), function (key, cb) {

        //retrieve data from ICS
        calendarservice.retrieveIcs(config.ics[key].url, function (err, rows) {

            events[key] = {
                'name': config.ics[key].name,
                'checkedByDefault': !!config.ics[key].checkedByDefault,
                'events': rows
            };

            cb(null, null);
        });
    }, function (err) {
        if (err) log.error(err);
        res.json(events);
    });


}



exports.getUrls = function (req, res, next) {
    res.json(config.ics);
}
