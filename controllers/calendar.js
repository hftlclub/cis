var async = require('async');
var config = require('../config');
var calendarservice = require('../services/calendarservice');

exports.listEvents = function(req, res, next) {
    if(!config.ics.length) return next(new Error('No ICS sources given'));

    var events = {};
    async.mapSeries(config.ics, function(ics, cb){

        calendarservice.retrieveIcs(ics.url, function(err, rows){
            events[ics.name] = rows;
            cb(null, null);
        });
    }, function(err){
        if(err) console.log(err);


        res.json(events);
    });


}
