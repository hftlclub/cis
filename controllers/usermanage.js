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
	var hashes = ldaphashes(password);
	
	//get next free unix ID
	userservice.nextFreeUnixID(1, function(err, uidnumber){
		
		//build new user object
		var user = {
			uid: data.username,
			mail: data.email,
			givenName: data.firstname,
			sn: data.lastname,
			street: data.street,
			postalCode: data.zip,
			l: data.city,
			telephoneNumber: data.tel,
			registeredAddress: data.teamdrive,
			loginShell: data.loginShell,
			employeeType: data.role,
		
			userPassword: hashes.userPassword,
			sambaNTPassword: hashes.sambaNTPassword,
			sambaLMPassword: hashes.sambaLMPassword,
		
			uidNumber: uidnumber		
		};
		
		//add new user
		userservice.addUser(user, function(err, success){
			if(err) next(err);
			
			res.json({
				'password': password
			}).end();
		});

	});

}



function ldaphashes(cleartext){
	return {
		'userPassword': ssha.create(cleartext),
		'sambaNTPassword': smbhash.nthash(cleartext),
		'sambaLMPassword': smbhash.lmhash(cleartext)
	};
}


function randomString(bytes){
	return crypto.randomBytes(bytes).toString('hex');
}