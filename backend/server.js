var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jwt-simple');


var app = express();

var ldap = require('./ldap');
var config = require('./config');

var auth = require('./controllers/auth');

var jwtauth = require('./middleware/jwtauth')
var requireAuth = require('./middleware/requireauth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));




app.post('/login', auth.login);


app.get('/secret', jwtauth, requireAuth, function(req, res){
    res.send('Club Admin Backend ' + JSON.stringify(req.user));
})

app.listen(config.port, function(err){
    console.log('Club Admin Backend Server started on port ' + config.port);
});
