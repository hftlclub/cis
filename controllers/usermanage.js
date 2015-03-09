var util = require('util');
var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');
var crypto = require('crypto');
var errors = require('common-errors');



exports.adduser = function(req, res, next){
	
	req.checkBody('username', 'Benutzername ungueltig').notEmpty().isAlphanumeric();
	req.checkBody('type', 'Nutzerechte ungueltig').notEmpty().isIn(['club', 'other']);

	req.sanitize('superuser').toBoolean();
	if(!req.body.loginShell) req.body.loginShell = '/bin/false';

	req.checkBody('email', 'E-Mail ungueltig').notEmpty().isEmail();
	req.checkBody('firstname', 'Vorname ungueltig').notEmpty();
	req.checkBody('lastname', 'Nachname ungueltig').notEmpty();
	
	req.checkBody('street', 'Strasse ungueltig').notEmpty();
	req.checkBody('zip', 'PLZ ungueltig').notEmpty().isNumeric();
	req.checkBody('city', 'Stadt ungueltig').notEmpty();
	req.checkBody('tel', 'Telefon ungueltig').notEmpty();

	//random password
	req.body.password = randomString(4);

	//get next free unix ID
	userservice.nextFreeUnixID(1, function(err, uidnumber){

		req.body.uidnumber = uidnumber;

		//add new user
		userservice.addUser(req.body, function(err, success){
			if(err) next(err);

			//return new password
			res.json({
				'password': req.body.password
			}).end();
		});
	});
}





exports.listusers = function(req, res, next){
	userservice.getUsers(function(err, users){
		res.json(users).end();
	});
}





exports.deleteuser = function(req, res, next){
	//prevent users from deleting themselves...
	if(req.params.uid == req.user.username) {
		var err = new Error('You cannot delete yourself, bitch...');
		err.status = 400;
		return next(err);
	}
	
	//delete user
	userservice.deleteUser(req.params.uid, function(err){
		if(err) next(err);
		
		res.send();
	});
}



function randomString(bytes){
	return crypto.randomBytes(bytes).toString('hex');
}
