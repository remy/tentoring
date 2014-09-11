'use strict';

var Questions = require('../models/Questions');

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

  app.get('/reply/:token', function (req, res) {
    res.redirect(app.settings.url + '/api/questions/' + req.params.token);
  });

  app.get('/signin', function (req, res) {
    res.render('index', {
      login: true
    });
  });

  app.get('/admin', function (req, res) {
    res.render('admin', { 
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

  app.get('/thankyou/:token', function (req, res) {
    Questions.findOne({token: req.params.token}).populate('by').exec(function (err, question, next) {
      if (err) {
        return next(err);
      }
      res.render('thank-you', question);
    });
  });

  app.get('/please', function(req, res){
    res.render('please');
  });

  app.get('/about', function (req, res) {
    res.render('about');
  });

  app.get('/asking-questions', function (req, res) {
    res.render('asking-questions');
  });

  app.get('/contact', function (req, res) {
    res.render('contact');
  });

};
