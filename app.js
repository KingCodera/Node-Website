
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , jade = require('jade')
  , fs = require('fs');

var app = express();
var about = require('./routes/about');
var publish = require('./routes/publish');
var test = require('./routes/test');


var AM = require('./server/modules/account-manager.js');

// all environments
app.set('port', process.env.PORT || 443);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/about', about.about);
app.get('/publish', publish.publish);
app.get('/test', test.index);

var options = {
	pfx: fs.readFileSync('./cert/dokisite.pfx'),
	passphrase: '.'
};

https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

