var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');
var smbhash = require('smbhash');
var ssha = require('ssha');
var crypto = require('crypto');

//var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress'];


exports.adduser = function(req, res, next){
	var user = req.body.user;
	
	/*res.statusCode = 400;
	next(new Error('SCHLIMM!'));*/
	
	//NTLM passwords
	var password = randomString(5);
	var pwhashes = ldaphashes(password);
	user.passwordcleartext = password;
	user.userPassword = pwhashes.userPassword;
	user.sambaNTPassword = pwhashes.sambaNTPassword;
	user.sambaLMPassword = pwhashes.sambaLMPassword;
	
	console.log(user);
	res.json(user);
	
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