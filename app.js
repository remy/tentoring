var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    hbs = require ('hbs'),
    mongoose = require('mongoose'),
    db = mongoose.connection,
    mongourl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/tinyanswers';

mongoose.connect(mongourl);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
  app.use(express.session({ secret: 'spa6kugo3chi4rti8wajy1no5ku' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('title', 'Tiny Answers');
});

app.configure('development', function() {
  app.use(express.errorHandler());
  app.set('url', 'http://localhost:' + app.get('port'));
  mongoose.set('debug', true);
});

app.configure('production', function () {
  app.set('url', 'http://www.tinyanswers.com');
});

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log ("We have connected...");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  routes(app);
});
