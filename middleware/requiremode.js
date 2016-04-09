var config = require('../config');

module.exports = function(mode) {
    return function(req, res, next) {

        if (mode == 'auth' && !req.user) {
            res.status(401).send(null);

        } else if (mode == 'su' && !req.user.superuser) {
            res.status(401).send('Must be superuser');

        } else if (mode == 'club' && req.user.type != 'club') {
            res.status(401).send('Must be club user');

        } else if (mode == 'pubaccess' && req.params.accesskey != config.pubaccesskey) {
            res.status(401).send('Invalid access key');

        } else {
            next();
        }
    }
}
