module.exports = function(req, res, next){
    if(req.user.type != 'club'){
        res.send('Must be club user', 401);
    }else{
        next();
    }
}