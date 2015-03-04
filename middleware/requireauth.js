module.exports = function(req, res, next){
    if(!req.user){
        res.send(null, 401);
    }else{
        next();
    }
}
