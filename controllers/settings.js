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

	if(req.validationErrors()){
		return next();
	}


	console.log('far beyond my scope');
	
	//is old password correct?
	userservice.checkpassword(req.user.username, req.body.oldPassword, function(err, success){
		if(err) return next(err);
		if(!success){
			req.checkBody('oldPassword', 'Altes Passwort nicht korrekt').error(1);
			next();
		}
		
		
		//SET new password!
		userservice.setPassword(req.user.username, req.body.newPassword1, function(err){
			if(err) next(err);
			res.end();
		});
		
		
	});

}