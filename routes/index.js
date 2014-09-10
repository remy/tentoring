'use strict';

module.exports = function (app) {

  function auth(req, res, next) {
    if (!req.session || !req.session.user) {
      req.session.afterLogin = req.url;
      res.render('login-please');
    } else {
      next();
    }
  }

  app.get('/', function (req, res) {
    if (req.session.user) {
      res.render('index-loggedin');
    } else {
      res.render('index', {
        login: false,
        skills: req.org.config.skills // TODO normalise
      });
    }
  });

  app.get('/signin', function (req, res) {
    res.render('index', {
      login: true
    });
  });

  app.get('/404', function (req, res) {
    res.render('error', {
      message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.',
      title: 'It went wrong'
    });
  });

  app.get('/next', function (req, res) {
    res.render('signed-up');
  });

  app.get('/ask', auth, function (req, res) {
    res.render('ask', {
      skills: req.org.config.skills
    });
  });

  app.get('/pass', function (req, res) {
    res.render('pass');
  });

  app.get('/postpone', function (req, res) {
    res.render('postpone');
  });

  // 404
  app.get('/cat', function(req, res){
    res.render('cat', {
      message: 'Whoa, nothing found, sorry. Cat?'
    });
  });

  app.get('/please', function(req, res){
    res.render('please');
  });

};