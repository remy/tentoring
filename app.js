'use strict';
var express = require('express');
var errorHandler = require('errorhandler');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var routes = require('./routes');
var api = require('./api');
var middleware = require('./lib/middleware');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var db = mongoose.connection;
var port = process.env.PORT || 8000;
var mongourl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/tentoring';
var pkg = require('./package.json');
var cron = require('./cron');

mongoose.connect(mongourl);

var app = express();

var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  app.use(errorHandler());
  app.set('root', (process.env.HOST || 'tentoring.dev') + ':' + port);
  mongoose.set('debug', true);
}

if (env === 'production') {
  app.set('root', 'tentoring.com');
  app.set('url', 'http://tentoring.com');
}

app.set('version', pkg.version);
app.set('url', 'http://' + app.get('root'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/im/pie.png'));
app.use(logger('dev'));
app.use(bodyParser());
app.use(cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
app.use(session({
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
  store: new MongoStore({
    mongoose_connection: db // jshint ignore:line
  }),
  secret: 'spa6kugo3chi4rti8wajy1no5ku'
}));


app.use(express.static(path.join(__dirname, 'public')));
middleware(app);

app.set('title', 'Tentoring');

// app.set('tags', ['Funding', 'Legal', 'Technology', 'Design', 'Marketing', 'Product', 'Social', 'Government', 'Introductions', 'Strategy', 'Media', 'Cats']);

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('Database ready');
  cron.checkForUnanswered.start();
});

var server = http.createServer(app).listen(port, function(){
  console.log('Server listening on http://localhost:' + server.address().port);
  app.use('/api', api);
  routes(app);
});
