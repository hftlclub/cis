var config = require('../config');
var userservice = require('../services/userservice');




exports.changepassword = function(req, res, next) {
    //all values set?
    req.checkBody('oldPassword', 'Altes Passwort nicht angegeben').notEmpty();
    req.checkBody('newPassword1', 'Neues Passwort nicht angegeben').notEmpty();
    req.checkBody('newPassword2', 'Neues Passwort (Wdhlg.) nicht angegeben').notEmpty();

    req.checkBody('newPassword2', 'Passw�rter nicht identisch').equals(req.body.newPassword1);

    if (req.validationErrors()) {
        return next();
    }

    //is old password correct?
    userservice.checkpassword(req.user.username, req.body.oldPassword, function(err, success) {
        if (err) return next(err);
        if (!success) {
            req.checkBody('oldPassword', 'Altes Passwort nicht korrekt').error(1);
            next();
        }

        //SET new password!
        userservice.setPassword(req.user.username, req.body.newPassword1, function(err) {
            if (err) next(err);
            res.end();
        });
    });
}






exports.changeprofile = function(req, res, next) {
    var uid = req.user.username; //me

    req.checkBody('email', 'E-Mail ung�ltig').notEmpty().isEmail();
    req.checkBody('firstname', 'Vorname ung�ltig').notEmpty();
    req.checkBody('lastname', 'Nachname ung�ltig').notEmpty();

    //req.checkBody('street', 'Strasse ung�ltig').notEmpty();
    //req.checkBody('zip', 'PLZ ung�ltig').notEmpty().isNumeric();
    //req.checkBody('city', 'Stadt ung�ltig').notEmpty();
    //req.checkBody('tel', 'Telefon ung�ltig').notEmpty();

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
        teamdrive: req.body.teamdrive,
        birthday: req.body.birthday
    };

    //edit user!
    userservice.editUser(uid, data, function(err, success) {
        if (err) next(err);
        //send response to client
        res.end();
    });
}
