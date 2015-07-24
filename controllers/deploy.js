var config = require('../config');


exports.deploy = function(req, res, next){
	console.log('Deploy Webhook fired');

	//check for deploy key
	if(req.params.key != config.deploykey){
		console.log('Invalid deploy key:', req.params.key);
		return next(new Error('Invalid deploy key'));
	}

	//get current branch
	exec('cd ' + __dirname + ' && git symbolic-ref HEAD ', function(error, stdout, stderr){
		var curref = stdout;
		
		//only pull when current branch changed
        if(req.body.ref != curref){
            console.log(req.body.ref);
			return res.send('Nothing to do here');
        }

		//PULL!
		exec('cd ' + __dirname + ' && git pull origin ' + config.branch, function(error, stdout, stderr){
			console.log(error, stdout, stderr);
			return res.send(stdout + stderr);
		});
	});

	
}