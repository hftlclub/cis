var config = require('../config');
var userservice = require('../services/userservice');


exports.changepassword = function(req, res, next) {
    //all values set?
    req.checkBody('oldPassword', 'Altes Passwort nicht angegeben').notEmpty();
    req.checkBody('newPassword1', 'Neues Passwort nicht angegeben').notEmpty();
    req.checkBody('newPassword2', 'Neues Passwort (Wdhlg.) nicht angegeben').notEmpty();

    req.checkBody('newPassword2', 'Passwörter nicht identisch').equals(req.body.newPassword1);

    if (req.validationErrors()) {
        return next();
    }

    //is old password correct?
    userservice.checkpassword(req.user.username, req.body.oldPassword, function(err, success) {
        if (err) return next(err);
        if (!success) {
            req.body.oldPassword = ''; //for security reasons, so that misspelled password does not appear in the logs
            req.checkBody('oldPassword', 'Altes Passwort nicht korrekt').error(1);
            next();
        }

        //SET new password!
        userservice.setPassword(req.user.username, req.body.newPassword1, function(err) {
            if (err) next(err);

            console.log(new Date() + ' SUCCESS User Password Change: ' + req.body.username);

            res.end();
        });
    });
}






exports.changeprofile = function(req, res, next) {
    var uid = req.user.username; //me

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
        alias: req.body.alias,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        tel: req.body.tel,
        birthday: req.body.birthday
    };

    //edit user!
    userservice.editUser(uid, data, function(err, success) {
        if (err) next(err);
        //send response to client
        res.end();
    });
}
