var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');
var smbhash = require('smbhash');
var ssha = require('ssha');
var crypto = require('crypto');

//var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress'];


exports.adduser = function(req, res, next){
	var data = req.body.user;
	
	//loginShell default to /bin/false
	data.loginShell = data.loginShell || '/bin/false';
	
	//random password
	var password = randomString(5);
	data.hashes = ldaphashes(password);
	
	//get next free unix ID
	userservice.nextFreeUnixID(1, function(err, uidnumber){
		
		data.uidnumber = uidnumber;
		
		//add new user
		userservice.addUser(data, function(err, success){
			if(err) next(err);
			
			//return new password
			res.json({
				'password': password
			}).end();
		});

	});

}



exports.listusers = function(req, res, next){
	userservice.getAll(function(err, users){
		res.json(users).end();
	});
}




function ldaphashes(cleartext){
	return {
		'userPassword'   : ssha.create(cleartext),
		'sambaNTPassword': smbhash.nthash(cleartext),
		'sambaLMPassword': smbhash.lmhash(cleartext)
	};
}


function randomString(bytes){
	return crypto.randomBytes(bytes).toString('hex');
}