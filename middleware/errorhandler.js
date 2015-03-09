exports.validation = function(req, res, next){
	var valerrors = req.validationErrors(true);
	if(valerrors){
		console.log(valerrors);
		res.status(400).json({error: valerrors}).end();
	}
}


exports.generic = function(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({error: err.message});
}