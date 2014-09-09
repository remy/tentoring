'use strict';
var User = require('../models/Users');
var Question = require('../models/Questions');
var hbs = require('hbs');
var fs = require('fs');
var path = require('path');
var emailDir = path.join(__dirname, '../views/emails/');

var emailClient = require('../lib/emailClient');

var marked = require('marked');
var _ = require('lodash');
var replyTemplate;
var questionTemplate;
var mongoose = require('mongoose');

fs.readFile(emailDir + '/email-question.hbs', 'utf8', function (err, source) {
  questionTemplate = hbs.handlebars.compile(source);
});

fs.readFile(emailDir + '/email-reply.hbs', 'utf8', function (err, source) {
  replyTemplate = hbs.handlebars.compile(source);
});

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

  app.post('/', function (req, res) {
    if (!req.body.skills) {
      // TODO make this field required and report back
      req.body.skills = [];
    }

    if (typeof req.body.skills === 'string') {
      req.body.skills = [req.body.skills];
    }

    var skills = req.body.skills.map(function (item) {
      return item.trim().replace(/,/, '');
    });

    var post = {
      name: req.body.name,
      email: req.body.email,
      orgs: [{
        org: req.org,
        skills: skills
      }]
    };

    new User(post).save(function (err, user) {
      if (err && err.code !== 11000) {
        res.render('error', {
          message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.'
        });
      } else if (!user && err.code === 11000) {
        User.findOne(post.email, function (err, user) {
          // TODO decide whether to update the user's skills
          // also check whether the user actually is in this org, and if not
          // add them in

          var found = user.orgs.filter(function (data) {
            return (data.org.toString() === req.org._id);
          });

          if (found.length === 0) {
            // FIXME this doesn't work...
            user.orgs.push(post.orgs);
            user.save();
          }

          req.session.user = user;
          res.redirect(req.session.afterLogin || '/next');
        });
      } else {
        req.session.user = user;
        res.redirect('/next');
      }
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

  app.get('/test/find-user', function (req, res) {
    var query = User
          .findOne({ 'orgs.skills': req.query.skill, 'orgs.org': req.org._id })
          .where('orgs.asked').lt(Date.now())
          .ne('email', req.query.email);

    query.exec(function (err, doc) {
      console.log(err, doc);
      res.send({ doc: doc, date: new Date() });
    });
  });

  app.post('/ask', function (req, res) {
    var skill = req.body.skill,
        now = Date.now();

    var body = {
      text: req.body.question,
      by: req.session.user._id,
      skill: skill
    };

    new Question(body).save(function (err, question) {
      var tried = 0;
      if (!err) {
        // find a mentor that matches the skill
        var query = User
          .findOne({ 'orgs.skills': req.query.skill, 'orgs.org': req.org._id })
          .where('orgs.asked').lt(Date.now())
          .ne('email', req.query.email);

        var success = function (err, user) {
          tried++;
          if (user) {
            res.render('asked');

            console.log('found a user...');
            // TODO filter by org
            user.asked = now;
            user.save();

            var body = questionTemplate({
              user: user,
              question: question,
              settings: app.settings
            }, {});

            // send email to that person
            console.log('Sending question to ' + user.name);

            emailClient.send({
              from: 'email-cat@tentoring.com',
              to: user.email,
              subject: 'Your mentoring skills are required',
              text: body
            }, function (err, message) {
              if (err) {
                console.error(message);
              }
            });
          } else if (tried === 1) {
            // couldn't find one, so we'll just grab the first
            User.findOne({ 'orgs.skills': skill, 'orgs.org': req.org }).ne('email', req.session.user.email).exec(success);
          } else {
            // give up
            // next(new Error("Damnit, there isn't anyone in our DATABASE."));
            res.render('error', {
              message: 'Annoyingly there isn\'t anyone available for that skill just yet, but hold on tight, more mentors are coming!'
            });
          }
        };

        query.exec(success);
      }
    });
  });

  app.param('token', function (req, res, next) {
    Question.findOne({ token: req.params.token }, function (err, question) {
      if (question) {
        question.populate({
          path: 'by'
        }, function (err, question) {
          req.question = question;
          next();
        });
      } else {
        next();
      }
    });
  });

  app.get('/reply/:token', auth, function (req, res) {
    if (req.question) {
      // TODO use a markdown helper in handlebars instead of doing here
      req.question.text_md = marked(req.question.text);
      res.render('reply', req.question.toObject());
    } else {
      res.render('error', {
        message: 'Sorry, I couldn\'t find your question, but I found this cat instead',
        title: 'It went wrong'
      });
    }
  });

  app.post('/reply/:token', auth, function (req, res) {
    var question = req.question;
    if (question) {
      // save reply
      question.reply = {
        by: req.session.user._id,
        text: req.body.reply
      };
      question.answered = true;

      question.save();

      // then send email to who it was made by
      req.question.populate({
        path: 'by'
      }, function (err, question) {
        var user = question.by;

        var body = replyTemplate({
          reply: {
            by: {
              name: req.session.user.name
            },
            text: req.body.reply
          },
          user: user,
          question: question,
          settings: app.settings
        }, {});

        // send email to that person
        console.log('Sending reply to ' + user.name + ' from ' + question.reply.by.name);

        emailClient.send({
          from: 'email-cat@tentoring.com',
          to: user.email,
          subject: 'Your question has been answered',
          text: body
        }, function (err, message) {
          if (err) {
            console.error(message);
          }
        });
      });
      res.render('thank-you', question);
    } else {
      res.render('error', {
        message: 'Sorry, I couldn\'t find your question, but I found this cat instead',
        title: 'It went wrong'
      });
    }
  });

  app.get('/thanks', function(req, res){
    Question.findOne({}, function (err, question) {
      question.populate({
        path: 'by'
      }, function (err, question) {
        res.render('thank-you', question);
      });
    });
  });

  app.post('/reply', function (req, res) {
    res.render('reply');
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