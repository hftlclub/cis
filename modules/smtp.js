var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var config = require('../config');

//create mailer
exports.conn = nodemailer.createTransport(smtpTransport(config.smtp));




exports.mail = function(to, template, val, callback) {
    //read body template
    fs.readFile(config.mailsettings.tplpath + template + '/body', function(err, data) {
        if (err) return callback(err);
        var body = data.toString();

        //read subject template
        fs.readFile(config.mailsettings.tplpath + template + '/subject', function(err, data) {
            if (err) return callback(err);
            var subject = data.toString();

            //go through supplied keys and replace placeholders in template
            for (var key in val) {
                body = body.replace('{' + key + '}', val[key]);
                subject = subject.replace('{' + key + '}', val[key]);
            }


            //send email
            exports.conn.sendMail({
                from: config.mailsettings.from,
                to: to,
                subject: subject,
                text: body
            });

            callback(null, true)

        });

    });
}
