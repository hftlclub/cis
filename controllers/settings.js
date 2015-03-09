var util = require('util');
var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');



exports.changepassword = function(req, res, next){
	//all values set?
	req.checkBody('oldPassword', 'Altes Passwort nicht angegeben').notEmpty();
	req.checkBody('newPassword1', 'Neues Passwort nicht angegeben').notEmpty();
	req.checkBody('newPassword2', 'Neues Passwort (Wdhlg.) nicht angegeben').notEmpty();
		
	req.checkBody('newPassword2', 'Passwoerter nicht identisch').equals(req.body.newPassword1);


	var errors = req.validationErrors(true);
	if(errors){
		res.send(util.inspect(errors), 400);
		return;
	}

	
	//is old password correct?
	userservice.checkpassword(req.user.username, req.body.oldPassword, function(err, success){
		if(err) return next(err);
		if(!success) return next(new Error('error yo'));
		
		
		//SET new password!
		userservice.setPassword(req.user.username, req.body.newPassword1, function(err){
			if(err) return next(err);
			res.end();
		});
		
		
	});

}