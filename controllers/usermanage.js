var util = require('util');
var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');
var crypto = require('crypto');
var errors = require('common-errors');



exports.adduser = function(req, res, next){

	//loginShell default to /bin/false
	//data.loginShell = data.loginShell || '/bin/false';

	req.checkBody('username', 'Benutzername ungueltig').notEmpty().isAlpha();

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
	console.log('check:',req.params.uid, '?=', req.user.username);
	if(req.params.uid == req.user.username) {
		var err = new Error('You cannot delete yourself, bitch...');
		err.status = 400;
		return next(err);
	}

	userservice.deleteUser(req.params.uid, function(err, success){
		if(err) next(err);

		//send status
		res.send('deleted data: ', req.params.uid);
	});
}



function randomString(bytes){
	return crypto.randomBytes(bytes).toString('hex');
}
