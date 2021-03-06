var config = require('../config');
var exec = require('child_process').exec
var trim = require('trim');
var log = require('../modules/log');


exports.deploy = function(req, res, next) {
    log.debug('Deploy Webhook fired');

    //check for deploy key
    if (req.params.key != config.deploykey) {
        return next(new Error('Invalid deploy key ' + req.params.key));
    }

    //get current branch
    exec('git symbolic-ref --short HEAD', {
        cwd: __dirname
    }, function(error, stdout, stderr) {
        var curbranch = trim(stdout);

        //only pull when current branch has changed
        if (req.body.ref != 'refs/heads/' + curbranch) {
            log.debug('Current branch: ' + req.body.ref);
            return res.send('Nothing to do here (current branch: refs/heads/' + curbranch + '; your branch: ' + req.body.ref + ')');
        }

        //PULL!
        exec('git pull origin ' + curbranch, {
            cwd: __dirname
        }, function(error, stdout, stderr) {
            if(error) next(error);
            return res.send(stdout + stderr);
        });
    });


}
