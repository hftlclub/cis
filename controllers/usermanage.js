var moment = require('moment');
var config = require('../config');
var smtp = require('../modules/smtp');
var utils = require('../modules/utils');
var userservice = require('../services/userservice');
var log = require('../modules/log');


//add user function for superusers
exports.adduser = function(req, res, next) {

    req.checkBody('username', 'Benutzername ungültig').notEmpty().isAlphanumeric();
    req.checkBody('type', 'Nutzerechte ungültig').notEmpty().isIn(['club', 'other']);

    req.checkBody('email', 'E-Mail ungültig').notEmpty().isEmail();
    req.checkBody('firstname', 'Vorname ungültig').notEmpty();
    req.checkBody('lastname', 'Nachname ungültig').notEmpty();

    //req.checkBody('street', 'Strasse ungültig').notEmpty();
    //req.checkBody('zip', 'PLZ ungültig').notEmpty().isNumeric();
    //req.checkBody('city', 'Stadt ungültig').notEmpty();
    //req.checkBody('tel', 'Telefon ungültig').notEmpty();

    if (req.validationErrors()) {
        return next();
    }

    //random password
    req.body.password = utils.uid(8);

    //force username to lowercase
    req.body.username = (req.body.username).toLowerCase();

    //add new user
    userservice.addUser(req.body, function(err, success) {
        if (err) {
            //throw validation error if entry already exists
            if (err.name == 'EntryAlreadyExistsError') {
                req.checkBody('username', 'Benutzername wird schon verwendet').error(1);
                next();
            } else {
                next(err);
            }
        }

        if (req.body.sendPassword) {
            var replace = {
                'username': req.body.username,
                'password': req.body.password,
                'name': req.body.firstname
            }

            //use alias name instead of firstname if set
            if (req.body.alias) replace.name = req.body.alias;

            smtp.mail(req.body.email, 'sendPwAdd', replace, function(err, success) {
                if (err) log.error(err);
            });
        }


        //return new password
        res.json({
            'username': req.body.username,
            'password': req.body.password
        }).end();
    });
}


//edit user function for superusers
exports.edituser = function(req, res, next) {
    var uid = req.params.uid;

    //no uid given
    if (!uid) {
        var err = new Error('UID missing');
        err.status = 400;
        return next(err);
    }

    req.checkBody('type', 'Nutzerrechte ungültig').notEmpty().isIn(['club', 'other']);

    req.checkBody('email', 'E-Mail ungültig').notEmpty().isEmail();
    req.checkBody('firstname', 'Vorname ungültig').notEmpty();
    req.checkBody('lastname', 'Nachname ungültig').notEmpty();

    //req.checkBody('street', 'Strasse ungültig').notEmpty();
    //req.checkBody('zip', 'PLZ ungültig').notEmpty().isNumeric();
    //req.checkBody('city', 'Stadt ungültig').notEmpty();
    //req.checkBody('tel', 'Telefon ungültig').notEmpty();

    if (req.validationErrors()) {
        return next();
    }

    //assemble data object. we have to make sure here you just edit those attributes you are allowed to
    var data = {
        type: req.body.type,
        former: req.body.former,
        honorary: req.body.honorary,
        executive: req.body.executive,
        applicant: req.body.applicant,
        onleave: req.body.onleave,
        alias: req.body.alias,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        displayname: req.body.firstname + ' ' + req.body.lastname,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        tel: req.body.tel,
        role: req.body.role,
        birthday: req.body.birthday,
        keyPermissions: req.body.keyPermissions
    };

    //accession date only for club members
    if (data.type == 'club' && req.body.accessiondate) {
        data.accessiondate = moment(req.body.accessiondate).toJSON();
    } else {
        data.accessiondate = null;
    }

    //sanitize date
    if (data.birthday) data.birthday = moment(data.birthday).toJSON();



    //you can only change superuser state of others (not your own)
    if (uid != req.user.username) {
        data.superuser = req.body.superuser;
    } else {
        data.superuser = req.user.superuser;
    }

    //edit user!
    userservice.editUser(uid, data, function(err, success) {
        if (err) next(err);
        //send response to client
        res.end();
    });
}



//list users function for superusers
exports.listusers = function(req, res, next) {
    userservice.getUsers(function(err, users) {
        if (err) return next(err);
        res.json(users).end();
    });
}




//get user function for superusers
exports.getuser = function(req, res, next) {
    var uid = req.params.uid;

    //no uid given
    if (!uid) {
        var err = new Error('UID missing');
        err.status = 400;
        return next(err);
    }

    userservice.getUserByUid(uid, function(err, user) {
        if (err) return next(err);
        res.json(user).end();
    });
}





exports.deleteuser = function(req, res, next) {
    //prevent users from deleting themselves...
    if (req.params.uid == req.user.username) {
        var err = new Error('You cannot delete yourself, bitch...');
        err.status = 400;
        return next(err);
    }

    //delete user
    userservice.deleteUser(req.params.uid, function(err) {
        if (err) next(err);

        res.send();
    });
}




//reset PW function for superusers
exports.resetPassword = function(req, res, next) {
    var uid = req.params.uid;
    var password = utils.uid(8);


    //no uid given
    if (!uid || !password) {
        var err = new Error('UID missing');
        err.status = 400;
        return next(err);
    }

    userservice.setPassword(uid, password, function(err, user) {
        if (err) return next(err);

        userservice.getUserByUid(uid, function(err, user) {
            if (err) return next(err);

            var replace = {
                'username': uid,
                'password': password,
                'name': user.firstname
            }

            //use alias name instead of firstname if set
            if (user.alias) replace.name = user.alias;

            smtp.mail(user.email, 'sendPwReset', replace, function(err) {
                if (err) return next(err);
                res.send();
            });
        });
    });
}
