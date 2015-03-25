var util = require('util');
var config = require('../config');
var ldap = require('../modules/ldap');
var smtp = require('../modules/smtp');
var userservice = require('../services/userservice');
var crypto = require('crypto');


//add user function for superusers
exports.adduser = function(req, res, next){

	req.checkBody('username', 'Benutzername ungültig').notEmpty().isAlphanumeric();
	req.checkBody('type', 'Nutzerechte ungültig').notEmpty().isIn(['club', 'other']);

	req.sanitize('superuser').toBoolean();
	if(!req.body.loginShell) req.body.loginShell = '/bin/false';

	req.checkBody('email', 'E-Mail ungültig').notEmpty().isEmail();
	req.checkBody('firstname', 'Vorname ungültig').notEmpty();
	req.checkBody('lastname', 'Nachname ungültig').notEmpty();

	//req.checkBody('street', 'Strasse ungültig').notEmpty();
	//req.checkBody('zip', 'PLZ ungültig').notEmpty().isNumeric();
	//req.checkBody('city', 'Stadt ungültig').notEmpty();
	//req.checkBody('tel', 'Telefon ungültig').notEmpty();

	if(req.validationErrors()){
		return next();
	}

	//random password
	req.body.password = randomString(4);

	//get next free unix ID
	userservice.nextFreeUnixID(1, function(err, uidnumber){

		req.body.uidnumber = uidnumber;

		//add new user
		userservice.addUser(req.body, function(err, success){
			if(err){
				//throw validation error if entry already exists
				if(err.name == 'EntryAlreadyExistsError'){
					req.checkBody('username', 'Benutzername wird schon verwendet').error(1);
					next();
				}else{
					next(err);
				}
			}

			if(req.body.sendPassword){
				var replace = {
					'username': req.body.username,
					'password': req.body.password,
					'firstname': req.body.firstname
				}
				
				smtp.mail(req.body.email, 'sendPwAdd', replace, function(err, success){
					if(err) console.log(err);
				});
			}
			

			//return new password
			res.json({
				'username': req.body.username,
				'password': req.body.password
			}).end();
		});
	});
}


//edit user function for superusers
exports.edituser = function(req, res, next){
	var uid = req.params.uid;

	//no uid given
	if(!uid){
		var err = new Error('UID missing');
		err.status = 400;
		return next(err);
	}

	req.checkBody('type', 'Nutzerechte ungültig').notEmpty().isIn(['club', 'other']);

	req.sanitize('superuser').toBoolean();

	req.checkBody('email', 'E-Mail ungültig').notEmpty().isEmail();
	req.checkBody('firstname', 'Vorname ungültig').notEmpty();
	req.checkBody('lastname', 'Nachname ungültig').notEmpty();

	//req.checkBody('street', 'Strasse ungültig').notEmpty();
	//req.checkBody('zip', 'PLZ ungültig').notEmpty().isNumeric();
	//req.checkBody('city', 'Stadt ungültig').notEmpty();
	//req.checkBody('tel', 'Telefon ungültig').notEmpty();

	if(req.validationErrors()){
		return next();
	}


	//assemble data object. we have to make sure here you just edit those attributes you are allowed to
	var data = {
		type:       req.body.type,
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

	//you can only change superuser state of others
	if(uid != req.user.username){
		data.superuser = req.body.superuser;
	}

	//loginShell only for superusers
	if(data.superuser){
		data.loginShell = req.body.loginShell;
	}else{
		data.loginShell = '/bin/false';
	}

	//edit user!
	userservice.editUser(uid, data, function(err, success){
		if(err) next(err);
		//send response to client
		res.end();
	});
}



//list users function for superusers
exports.listusers = function(req, res, next){
	userservice.getUsers(function(err, users){
		if(err) return next(err);
		res.json(users).end();
	});
}




//get user function for superusers
exports.getuser = function(req, res, next){
	var uid = req.params.uid;

	//no uid given
	if(!uid){
		var err = new Error('UID missing');
		err.status = 400;
		return next(err);
	}

	userservice.getUserByUid(uid, function(err, user){
		if(err) return next(err);
		res.json(user).end();
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
