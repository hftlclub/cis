var config = require('../config');

module.exports = function(mode) {
    return function(req, res, next) {

        if (mode == 'auth' && !req.user) {
            res.send(null, 401);

        } else if (mode == 'su' && !req.user.superuser) {
            res.send('Must be superuser', 401);

        } else if (mode == 'club' && req.user.type != 'club') {
            res.send('Must be club user', 401);

        } else if (mode == 'pubaccess' && req.params.accesskey != config.pubaccesskey) {
            res.send('Invalid access key', 401);

        } else {
            next();
        }
    }
}
