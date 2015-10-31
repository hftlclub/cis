var moment = require('moment');
var md = require('markdown').markdown;
var fs = require('fs');
var config = require('../config');
var utils = require('../modules/utils');
var protocolsservice = require('../services/protocolsservice');


//add user function for superusers
exports.addedit = function(req, res, next) {

    //decide form mode
    var mode;
    if (req.method == 'PUT') mode = 'edit';
    else if (req.method == 'POST') mode = 'add';
    else return next();



    //error if edit and no ID given
    if (mode == 'edit' && !req.params.id) {
        var err = new Error('ID missing');
        err.status = 400;
        return next(err);
    }

    /**********************************/


    req.checkBody('title', 'Titel ungültig').notEmpty();
    req.checkBody('recorder', 'Protokollführer ungültig').notEmpty();
    req.checkBody('text', 'Protokolltext ungültig').notEmpty();
    req.checkBody('date', 'Datum ungültig').notEmpty();
    req.checkBody('start', 'Startzeit ungültig').notEmpty();
    req.checkBody('end', 'Endzeit ungültig').notEmpty();

    if (req.validationErrors()) {
        return next();
    }



    //build new object
    var prot = {
        "title": req.body.title,
        "recorder": req.body.recorder,
        "text": req.body.text,
        "comment": req.body.comment,
        "attendants": req.body.attendants
    }

    //merge date and start/end time
    var start = moment(req.body.date).hour(moment(req.body.start).hour()).minute(moment(req.body.start).minute());
    prot.start = utils.moment2mysql(start);

    var end = moment(req.body.date).hour(moment(req.body.end).hour()).minute(moment(req.body.end).minute());
    prot.end = utils.moment2mysql(end);


    /**********************************/


    if (mode == 'edit') {
        protocolsservice.edit(req.params.id, prot, function(err, id) {
            if (err) {
                return next(err);
            }

            return res.send();
        });


    } else if (mode == 'add') {
        //add new protocol
        protocolsservice.add(prot, function(err, id) {
            if (err) {
                return next(err);
            }

            //return new id
            return res.json({
                'id': id
            }).end();
        });
    }
}




exports.get = function(req, res, next) {
    var id = req.params.id;

    //no id given
    if (!id) {
        var err = new Error('ID missing');
        err.status = 400;
        return next(err);
    }

    protocolsservice.get(id, function(err, prot) {
        if (err) return next(err);

        //make up data
        prot.date = prot.start; //date is a timestamp for the datepicker

        return res.json(prot).end();
    });
}







exports.getDetail = function(req, res, next) {
    var id = req.params.id;

    //no id given
    if (!id) {
        var err = new Error('ID missing');
        err.status = 400;
        return next(err);
    }

    protocolsservice.get(id, function(err, row) {
        if (err) return next(err);

        var out = {
            "title": row.title,
            "recorder": row.recorder,
            "start": row.start,
            "end": row.end,
            "comment": row.comment
        };

        //convert MD to HTML
        out.html = md.toHTML(row.text);

        //group attendants
        out.attendants = {
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
                    out.attendants.later.push(att.name);
                    continue;
                }
            }

            if (att.type == 'member') {
                out.attendants.members.push(att.name);
                continue;
            }

            if (att.type == 'applicant') {
                out.attendants.applicants.push(att.name);
                continue;
            }

            if (att.type == 'guest') {
                out.attendants.guests.push(att.name);
                continue;
            }
        }


        return res.json(out).end();
    });
}









exports.list = function(req, res, next) {
    protocolsservice.list(true, function(err, rows) {
        if (err) return next(err);

        if (!rows.length) return res.json({});

        //if /?grouped return results grouped by year
        if (req.query.hasOwnProperty('grouped')) {
            var out = {};
            rows.forEach(function(row) {
                var year = moment(row.date).year();

                //check whether group for this year already exists. if not, initialize it
                if (!out.hasOwnProperty(year)) {
                    out[year] = [];
                }

                out[year].push(row);

            });

            return res.json(out).end();
        }


        //if not /?grouped, return results in one list
        return res.json(rows).end();
    });
}




exports.del = function(req, res, next) {

    //no id given
    if (!req.params.id) {
        var err = new Error('ID missing');
        err.status = 400;
        return next(err);
    }

    protocolsservice.del(req.params.id, function(err) {
        if (err) return next(err);

        return res.send();
    });
}





exports.pdf = function(req, res, next){
    var id = req.params.id;

    //no id given
    if (!id) {
        var err = new Error('ID missing');
        err.status = 400;
        return next(err);
    }


    protocolsservice.makePdf(id, '/tmp/', function(err, location, filename){
        if(err) return next(err);

        //create destination folder
        var subDir = utils.uid(32) + '/';
        var dir = config.protocols.pdfFullPath + subDir;

        fs.mkdir(dir, function(err){
            if(err) return next(err);

            //move temp file to destination folder
            fs.rename(location, dir + filename, function(err){

                //set timer for garbage collection
                setTimeout(function(){
                    //delete PDF file
                    fs.unlink(dir + filename, function(err){
                        //delete folder
                        fs.rmdir(dir, function(err){
                            //console.log('GC done');
                        });
                    });

                }, (config.protocols.pdfDeleteTimeout * 1000));

                //send PDF filename and delete timeout
                var out = {
                    pdf: config.protocols.pdfFrontendPath + subDir + filename,
                    delTimeout: config.protocols.pdfDeleteTimeout
                }
                res.json(out);

            });
        });




    });
}
