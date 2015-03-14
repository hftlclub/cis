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






exports.changeprofile = function(req, res, next){
	var uid = req.user.username; //me

	req.checkBody('email', 'E-Mail ungueltig').notEmpty().isEmail();
	req.checkBody('firstname', 'Vorname ungueltig').notEmpty();
	req.checkBody('lastname', 'Nachname ungueltig').notEmpty();
	
	req.checkBody('street', 'Strasse ungueltig').notEmpty();
	req.checkBody('zip', 'PLZ ungueltig').notEmpty().isNumeric();
	req.checkBody('city', 'Stadt ungueltig').notEmpty();
	req.checkBody('tel', 'Telefon ungueltig').notEmpty();
	
	if(req.validationErrors()){
		return next();
	}


	//assemble data object. we have to make sure here you just edit those attributes you are allowed to
	var data = {
		email:      req.body.email,
		firstname:  req.body.firstname,
		lastname:   req.body.lastname,
		street:     req.body.street,
		zip:        req.body.zip,
		city:       req.body.city,
		tel:        req.body.tel,
		teamdrive:  req.body.teamdrive,
		role:       req.body.role
	};
	
	//edit user!
	userservice.editUser(uid, data, function(err, success){
		if(err) next(err);
		//send response to client
		res.end();
	});
}
