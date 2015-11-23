var async = require('async');
var config = require('../config');
var calendarservice = require('../services/calendarservice');

exports.listEvents = function(req, res, next) {
    var events = {};
    async.mapSeries(Object.keys(config.ics), function(key, cb){

        calendarservice.retrieveIcs(config.ics[key], function(err, rows){
            events[key] = rows;
            cb(null, null);
        });
    }, function(err){
        if(err) console.log(err);

        res.json(events);
    });


}



exports.getUrls = function(req, res, next) {
    res.json(config.ics);
}
