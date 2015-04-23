var xlsx = require('node-xlsx');
var moment = require('moment');
var config = require('../config');
var doorkeyservice = require('../services/doorkeyservice');



//list users function for superusers
exports.getDoorPermissionsList = function(req, res, next){
	doorkeyservice.getDoorPermissionsList(function(err, rows){
		if(err) return next(err);
		res.json(rows).end();
	});
}