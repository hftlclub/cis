var config = require('../config');
var exec = require('child_process').exec

exports.deploy = function(req, res, next){
	console.log('Deploy Webhook fired');

	//check for deploy key
	if(req.params.key != config.deploykey){
		console.log('Invalid deploy key:', req.params.key);
		return next(new Error('Invalid deploy key'));
	}

	//get current branch
	exec('git symbolic-ref --short HEAD', {cwd: __dirname}, function(error, stdout, stderr){
		var curbranch = stdout;
		
		//only pull when current branch has changed
        if(req.body.ref != 'refs/heads/' + curbranch){
            console.log(req.body.ref);
			return res.send('Nothing to do here');
        }

		//PULL!
		exec('git pull origin ' + curbranch, {cwd: __dirname}, function(error, stdout, stderr){
			console.log(error, stdout, stderr);
			return res.send(stdout + stderr);
		});
	});

	
}