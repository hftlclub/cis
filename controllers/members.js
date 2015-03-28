var util = require('util');
var moment = require('moment');
var config = require('../config');
var ldap = require('../modules/ldap');
var smtp = require('../modules/smtp');
var membersservice = require('../services/membersservice');
var crypto = require('crypto');



//list users function for superusers
exports.listmembers = function(req, res, next){
	membersservice.getMembers(function(err, members){
		if(err) return next(err);
		res.json(members).end();
	});
}


