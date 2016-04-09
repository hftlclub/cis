var log = require('../modules/log');

exports.validation = function(req, res, next) {
    var valerrors = req.validationErrors(true);
    if (valerrors) {
        //log.debug(valerrors);
        res.status(400).json({
            validationerror: valerrors
        }).end();
    }
}


exports.generic = function(err, req, res, next) {
    log.error(err.message);
    res.status(err.status || 500).json({
        error: err.message
    });
}
