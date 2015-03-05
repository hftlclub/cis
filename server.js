var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jwt-simple');
var cors = require('cors')

var app = express();
var api = express.Router();

var ldap = require('./modules/ldap');
var config = require('./config');

var auth = require('./controllers/auth');
var usermanage = require('./controllers/usermanage');


var jwtauth = require('./middleware/jwtauth')
var requireAuth = require('./middleware/requireauth');

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
}));

api.use(cors({ origin: '*' }));

//static frontend
app.use(express.static(__dirname + '/frontend'));



//routes
api.post('/login', auth.login);
api.get('/userdata', jwtauth, requireAuth, function(req, res){
    res.json(req.user);
});
api.get('/user', jwtauth, requireAuth, usermanage.listusers);
api.post('/user', jwtauth, requireAuth, usermanage.adduser);



//assign api router to /api
app.use('/api', api);


//start server
app.listen(config.port, function(err){
    console.log('Club Admin Backend Server started on port ' + config.port);
});
