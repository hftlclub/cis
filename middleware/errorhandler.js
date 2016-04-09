exports.validation = function(req, res, next) {
    var valerrors = req.validationErrors(true);
    if (valerrors) {
        console.log(new Date().toString() + ':', valerrors);
        res.status(400).json({
            validationerror: valerrors
        }).end();
    }
}


exports.generic = function(err, req, res, next) {
    console.error(new Date().toString(), ':', err);
    res.status(err.status || 500).json({
        error: err.message
    });
}
