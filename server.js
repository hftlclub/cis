var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jwt-simple');
var cors = require('cors');

var app = express();
var api = express.Router();

var ldap = require('./modules/ldap');
var config = require('./config');

var auth = require('./controllers/auth');
var usermanage = require('./controllers/usermanage');
var settings = require('./controllers/settings');


var jwtauth = require('./middleware/jwtauth')
var requireAuth = require('./middleware/requireauth');
var errorhandler = require('./middleware/errorhandler');

api.use(cors({ origin: '*' }));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator({
	customValidators: {
		error: function(value, error) {
			return !error;
    	}
	}   
}));


//static frontend
app.use(express.static(__dirname + '/frontend'));



//routes
api.post('/login', auth.login);
api.get('/userdata', jwtauth, requireAuth, function(req, res){
    res.json(req.user);
});
api.get('/user', jwtauth, requireAuth, usermanage.listusers);
api.post('/user', jwtauth, requireAuth, usermanage.adduser);
api.put('/user/:uid', jwtauth, requireAuth, usermanage.edituser);
api.delete('/user/:uid', jwtauth, requireAuth, usermanage.deleteuser);


api.post('/settings/changepassword', jwtauth, requireAuth, settings.changepassword);



//error handling
api.use(errorhandler.validation);
api.use(errorhandler.generic);


//assign api router to /api
app.use('/api', api);


//start server
app.listen(config.port, function(err){
    console.log('Club Admin started on port ' + config.port);
});
