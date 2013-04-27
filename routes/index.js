var User = require('../db/user'),
    Question = require('../db/question'),
    nodemailer = require('nodemailer'),
    mailer = nodemailer.createTransport('sendmail'),
    hbs = require('hbs'),
    fs = require('fs'),
    path = require('path'),
    emailDir = path.join(__dirname, '../views/'),
    SendGrid = require('sendgrid').SendGrid,
    sendgrid = new SendGrid(
      process.env.SENDGRID_USERNAME,
      process.env.SENDGRID_PASSWORD
    ),
    replyTemplate,
    questionTemplate;

fs.readFile(emailDir + '/email-question.txt', 'utf8', function (err, source) {
  questionTemplate = hbs.handlebars.compile(source);
});

fs.readFile(emailDir + '/email-reply.txt', 'utf8', function (err, source) {
  replyTemplate = hbs.handlebars.compile(source);
});

module.exports = function (app) {
  function auth(req, res, next) {
    if (!req.session || !req.session.user) {
      res.redirect('/404');
    } else {
      next();
    }
  }

  app.get('/', function (req, res) {
    if (req.session.user) {
      res.render('index-loggedin');
    } else {
      res.render('index');
    }
  });

  app.get('/404', function (req, res) {
    res.render('error', {
      message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.',
      title: 'It went wrong'
    });
  });

  app.post('/', function (req, res) {
    if (typeof req.body.tags === 'string') {
      req.body.tags = [req.body.tags];
    }
    var post = {
      name: req.body.name,
      email: req.body.email,
      tags: req.body.tags.map(function (item) {
        return item.trim().replace(/,/, '');
      })
    };

    var user = new User(post).save(function (err, user) {
      if (err && err.code !== 11000) {
        res.render('error', {
          message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.'
        });
      } else if (!user) {
        User.findOne(post.email, function (err, user) {
          req.session.user = user;
          res.redirect('/next');
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
      tags: req.session.user.tags
    });
  });

  app.post('/ask', function (req, res, next) {
    var tag = req.body.tag,
        now = Date.now();

    var body = {
      text: req.body.question,
      by: req.session.user._id,
      tag: tag
    };

    var question = new Question(body).save(function (err, question) {
      var tried = 0;
      if (!err) {
        // find a mentor that matches the tag
        var query = User
          .findOne({ tags: tag })
          .where('last_asked').lt(now)
          .ne('email', req.session.user.email);

        var success = function (err, user) {
          tried++;
          if (user) {
            res.render('asked');

            console.log('found a user...');
            user.last_asked = now;
            user.save();

            var body = questionTemplate({
              user: user,
              question: question,
              settings: app.settings
            }, {});

            // send email to that person
            console.log('Sending question to ' + user.name);

            sendgrid.send({
              from: "Tentoring's email dooberry <email-cat@tentoring.com>",
              to: user.name + ' <' + user.email + '>',
              subject: 'Your mentoring skills are required',
              text: body
            });
          } else if (tried === 1) {
            // couldn't find one, so we'll just grab the first
            User.findOne({ 'tags': tag }).ne('email', req.session.user.email).exec(success);
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
        req.question = question;
      }
      next();
    });
  });

  app.get('/reply_test', function (req, res) {
    Question.findOne({}, function (err, question) {
      res.render('reply', question);
    });
  });

  app.get('/reply/:token', function (req, res) {
    if (req.question) {
      res.render('reply', req.question);
    } else {
      res.render('404', {
        message: "Sorry, I couldn't find your question, but I found this cat instead",
        title: 'It went wrong'
      });
    }
  });

  app.get('/reply/:token/timeout', function (req, res) {
    // this doesn't happen anymore - if it timesout, it's been sent!
  });

  app.post('/reply/:token', function (req, res) {
    var question = req.question;
    if (question) {
      // save reply
      question.reply = {
        by: req.session.user._id,
        text: req.body.reply
      };
      question.answered = true;

      question.save(function () {});

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

        sendgrid.send({
          from: "Tentoring's email dooberry <email-cat@tentoring.com>",
          to: user.name + ' <' + user.email + '>',
          subject: 'Your question has been answered',
          text: body
        });
      });
      res.render('thank-you');
    } else {
      res.render('404', {
        message: "Sorry, I couldn't find your question, but I found this cat instead",
        title: 'It went wrong'
      });
    }
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

};