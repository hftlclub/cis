var moment = require('moment');
var md = require( "markdown" ).markdown;
var config = require('../config');
var utils = require('../modules/utils');
var protocolsservice = require('../services/protocolsservice');


//add user function for superusers
exports.addedit = function(req, res, next){
	
	//decide form mode
	var mode;
	if(req.method == 'PUT') mode = 'edit';
	else if(req.method == 'POST') mode = 'add';
	else return next();
	
	
	
	//error if edit and no ID given
	if(mode == 'edit' && !req.params.id){
		var err = new Error('ID missing');
		err.status = 400;
		return next(err);
	}
	
	/**********************************/
	
	
	//sanitize to integer
	req.body.start.mm = parseInt(req.body.start.mm);
	req.body.start.hh = parseInt(req.body.start.hh);
	req.body.end.mm = parseInt(req.body.end.mm);
	req.body.end.hh = parseInt(req.body.end.hh);
	
	req.checkBody('title', 'Titel ungültig').notEmpty();
	req.checkBody('recorder', 'Protokollführer ungültig').notEmpty();
	req.checkBody('text', 'Protokolltext ungültig').notEmpty();
	req.checkBody('date', 'Datum ungültig').notEmpty();
	req.checkBody('start.hh', 'Startzeit ungültig').notEmpty().isInt();
	req.checkBody('start.mm', 'Startzeit ungültig').notEmpty().isInt();
	req.checkBody('end.hh', 'Endzeit ungültig').notEmpty().isInt();
	req.checkBody('end.mm', 'Endzeit ungültig').notEmpty().isInt();

	if(req.validationErrors()){
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
	var start = moment(req.body.date).hour(req.body.start.hh).minute(req.body.start.mm);
	prot.start = utils.moment2mysql(start);
	
	var end = moment(req.body.date).hour(req.body.end.hh).minute(req.body.end.mm);
	prot.end = utils.moment2mysql(end);


	/**********************************/


	if(mode == 'edit'){
		protocolsservice.edit(req.params.id, prot, function(err, id){
			if(err){
				return next(err);
			}
	
			return res.send();
		});
	
	
	}else if(mode == 'add'){		
		//add new protocol
		protocolsservice.add(prot, function(err, id){
			if(err){
				return next(err);
			}
	
			//return new id
			return res.json({
				'id': id
			}).end();
		});
	}
}




exports.get = function(req, res, next){
	var id = req.params.id;

	//no id given
	if(!id){
		var err = new Error('ID missing');
		err.status = 400;
		return next(err);
	}

	protocolsservice.get(id, function(err, prot){
		if(err) return next(err);
		
		//make up data
		prot.date = prot.start; //date is a timestamp for the datepicker
		
		var start = moment(prot.start); //start and end are HH:MM
		prot.start = {
			"hh": start.hour(),
			"mm": start.minute()
		}
		
		var end = moment(prot.end);
		prot.end = {
			"hh": end.hour(),
			"mm": end.minute()
		}
		
		return res.json(prot).end();
	});
}







exports.getDetail = function(req, res, next){
	var id = req.params.id;

	//no id given
	if(!id){
		var err = new Error('ID missing');
		err.status = 400;
		return next(err);
	}

	protocolsservice.get(id, function(err, row){
		if(err) return next(err);
		
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
		
		for(var i = 0; i < row.attendants.length; i++){ //go through attendants and put them into groups
			var att = row.attendants[i];
			
			if(att.later){
				out.attendants.later.push(att.name + ' (' + moment(att.later).format('HH:mm') + ' Uhr)');
				continue;
			}
						
			if(att.type == 'member'){
				out.attendants.members.push(att.name);
				continue;
			}
			
			if(att.type == 'applicant'){
				out.attendants.applicants.push(att.name);
				continue;
			}
			
			if(att.type == 'guest'){
				out.attendants.guests.push(att.name);
				continue;
			}
		}
		
		
		return res.json(out).end();
	});
}










exports.list = function(req, res, next){
	protocolsservice.list(true, function(err, rows){
		if(err) return next(err);
		
		//if /?grouped return results grouped by year
		if(req.query.hasOwnProperty('grouped')){
			var out = {};
			rows.forEach(function(row){
				var year = moment(row.date).year();
			
				//check whether group for this year already exists. if not, initialize it
				if(!out.hasOwnProperty(year)){
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




exports.del = function(req, res, next){

	//no id given
	if(!req.params.id){
		var err = new Error('ID missing');
		err.status = 400;
		return next(err);
	}
	
	protocolsservice.del(req.params.id, function(err){
		if(err) return next(err);

		return res.send();
	});
}







