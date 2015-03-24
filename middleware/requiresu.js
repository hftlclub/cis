module.exports = function(req, res, next){
    if(!req.user.superuser){
        res.send('Must be superuser', 401);
    }else{
        next();
    }
}