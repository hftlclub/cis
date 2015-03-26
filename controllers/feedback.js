var config = require('../config');
var smtp = require('../modules/smtp');


exports.sendFeedback = function(req, res, next){
	if(!req.body.text || !req.body.main){
		res.end();
	}
	
	var replace = {
		name: req.body.name,
		text: req.body.text,
		date: new Date().toString()
	};
	
	smtp.mail(config.feedbackmail, 'feedback', replace, function(err, success){
		if(err) console.log(err);
	});	
	
}