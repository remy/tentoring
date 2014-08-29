'use strict';
var express = require('express'),
    routes = require('./routes'),
    middleware = require('./lib/middleware'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(express),
    db = mongoose.connection,
    port = process.env.PORT || 8000,
    mongourl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/tentoring';

mongoose.connect(mongourl);

var app = express();

var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  app.use(express.errorHandler());
  app.set('root', (process.env.HOST || 'tentoring.dev') + ':' + port);
  mongoose.set('debug', true);
}

if (env === 'production') {
  app.set('root', 'tentoring.com');
  app.set('url', 'http://tentoring.com');
}

app.set('url', 'http://' + app.get('root'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
app.use(express.session({
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
  store: new MongoStore({
    mongoose_connection: db // jshint ignore:line
  }),
  secret: 'spa6kugo3chi4rti8wajy1no5ku'
}));


app.use(express.static(path.join(__dirname, 'public')));
middleware(app);
app.use(app.router);

app.set('title', 'Tentoring');

// app.set('tags', ['Funding', 'Legal', 'Technology', 'Design', 'Marketing', 'Product', 'Social', 'Government', 'Introductions', 'Strategy', 'Media', 'Cats']);

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('Database ready');
});

var server = http.createServer(app).listen(port, function(){
  console.log('Server listening on http://localhost:' + server.address().port);
  routes(app);
});
