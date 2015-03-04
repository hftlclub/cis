var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jwt-simple');


var app = express();
var api = express.Router();

var ldap = require('./ldap');
var config = require('./config');

var auth = require('./controllers/auth');

var jwtauth = require('./middleware/jwtauth')
var requireAuth = require('./middleware/requireauth');

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
}));




api.post('/login', auth.login);


api.get('/secret', jwtauth, requireAuth, function(req, res){
    res.send('Club Admin Backend ' + JSON.stringify(req.user));
})


//assign api router to /api
app.use('/api', api);

//start server
app.listen(config.port, function(err){
    console.log('Club Admin Backend Server started on port ' + config.port);
});
