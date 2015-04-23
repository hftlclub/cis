var config = require('../config');
var doorkeyservice = require('../services/doorkeyservice');



//list users function for superusers
exports.getDoorKeyList = function(req, res, next){
	doorkeyservice.getDoorKeyList(function(err, rows){
		if(err) return next(err);
		res.json(rows).end();
	});
}