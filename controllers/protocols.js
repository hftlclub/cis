var moment = require('moment');
var md = require('markdown').markdown;
var fs = require('fs');
var mv = require('mv');
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

    if(!req.body.attendants.length){
        req.checkBody('attendants', 'Keine Teilnehmer angegeben').error(1);
    }

    if (req.validationErrors()) {
        return next();
    }



    //build new object
    var prot = {
        "title": req.body.title,
        "recorder": req.body.recorder,
        "chairperson": req.body.chairperson,
        "location": req.body.location,
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

    protocolsservice.get(id, function(err, row) {
        if (err) return next(err);
        if (!row) return next(new Error('Protocol ' + id + ' not found'));

        //make up data
        row.date = row.start; //date is a timestamp for the datepicker

        return res.json(row).end();
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
        if (!row) return next(new Error('Protocol ' + id + ' not found'));

        var out = {
            "title": row.title,
            "recorder": row.recorder,
            "chairperson": row.chairperson,
            "location": row.location,
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


    protocolsservice.makePdf(id, '/tmp/', function(err, location, filenames){
        if(err) return next(err);

        //create destination folder
        var subDir = utils.uid(32) + '/';
        var dir = config.protocols.pdfFullPath + subDir;

        fs.mkdir(dir, function(err){
            if(err) return next(err);

            // move PDF temp file to destination folder
            mv(location.pdf, (dir + filenames.pdf), function(err){
                if(err) return next(err);
                // move MD temp file
                mv(location.md, (dir + filenames.md), function(err){
                    if(err) return next(err);

                    // set timer for garbage collection
                    setTimeout(function(){
                        // delete PDF file
                        fs.unlink(dir + filenames.pdf, function(err) {
                            if(err) next(err);
                            // delete MD file
                            fs.unlink(dir + filenames.md, function(err) {
                                if(err) next(err);

                                //delete folder
                                fs.rmdir(dir, function(err){
                                    if(err) next(err);
                                });
                            });
                        });
                    }, (config.protocols.pdfDeleteTimeout * 1000));
                

                    //send PDF filename and delete timeout
                    let fullFrontendPath = config.protocols.pdfFrontendPath + subDir;
                    let out = {
                        pdf: fullFrontendPath + filenames.pdf,
                        md: fullFrontendPath + filenames.md,
                        delTimeout: config.protocols.pdfDeleteTimeout
                    }
                    res.json(out);
                });
            });
        });
    });
}
