var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');
var smbhash = require('smbhash');
var ssha = require('../modules/ssha');
var crypto = require('crypto');

//var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress'];


exports.adduser = function(req, res, next){
	var user = req.body.user;
	
	/*res.statusCode = 400;
	next(new Error('SCHLIMM!'));*/
	
	//NTLM passwords
	var password = randomString(5);
	var pwhashes = pwhashes(password);
	user.passwordcleartext = password;
	user.userPassword = pwhashes.userPassword;
	user.sambaNTPassword = pwhashes.sambaNTPassword;
	user.sambaLMPassword = pwhashes.sambaLMPassword;
	
	console.log(user);
	res.json(user);
	
}



function pwhashes(cleartext){
	return {
		'userPassword': ssha.ssha(cleartext),
		'sambaNTPassword': smbhash.nthash(cleartext),
		'sambaLMPassword': smbhash.lmhash(cleartext)
	}
}


function randomString(bytes){
	crypto.randomBytes(bytes, function(ex, buf) {
		var token = buf.toString('hex');
	});
}