var config = require('../config');

module.exports = function(req, res, next){
    if(req.params.accesskey != config.pubaccesskey){
        res.send('Invalid access key', 401);
    }else{
        next();
    }
}