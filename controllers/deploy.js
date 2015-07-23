var config = require('../config');


exports.deploy = function(req, res, next){
	console.log('Deploy Webhook fired');

	//check for deploy key
	if(req.params.key != config.deploykey){
		console.log('Invalid deploy key:', req.params.key);
		return next(new Error('Invalid deploy key'));
	}

	//only pull when master changed
        if(req.body.ref != 'refs/heads/' + config.branch){
            console.log(req.body.ref);
			return res.send('Nothing to do here');
        }

	//PULL!
	exec('cd ' + __dirname + ' && git pull origin ' + config.branch, function(error, stdout, stderr){
		console.log(error, stdout, stderr);
		res.send(stdout + stderr);
	});
}