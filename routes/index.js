var User = require('../db/user'),
    Question = require('../db/question'),
    nodemailer = require('nodemailer'),
    mailer = nodemailer.createTransport('sendmail'),
    hbs = require('hbs'),
    fs = require('fs'),
    path = require('path'),
    source = fs.readFileSync(path.join(__dirname, '../views/email-question.txt'), 'utf8'),
    emailTemplate = hbs.handlebars.compile(source);

module.exports = function (app) {
  function auth(req, res, next) {
    if (!req.session || !req.session.user) {
      res.redirect('/404');
    } else {
      next();
    }
  }

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.get('/404', function (req, res) {
    res.render('error', {
      message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.',
      title: 'It went wrong'
    });
  });

  app.post('/', function (req, res) {
    var post = {
      name: req.body.name,
      email: req.body.email,
      tags: req.body.tags.split(' ').map(function (item) {
        return item.trim().replace(/,/, '');
      })
    };

    var user = new User(post).save(function (err, user) {
      if (err && err.code !== 11000) {
        console.log(err);
        res.render('error', {
          message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.'
        });
      } else if (!user) {
        User.findOne(post.email, function (err, user) {
          req.session.user = user;
          res.redirect('/ask');
        });
      } else {
        req.session.user = user;
        res.redirect('/ask');
      }
    });
  });

  app.get('/ask', auth, function (req, res) {
    console.log(req.session.user.tags)
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
        var query = User.findOne({ tags: tag });
        query.where('last_asked').lt(now);

        var success = function (err, user) {
          tried++;
          if (user) {
            console.log('found a user...');
            user.last_asked = now;
            user.save();

            var body = emailTemplate({
              user: user,
              question: question
            }, {});

            // send email to that person
            console.log('Sending question to ' + user.name);
            mailer.sendMail({
              from: "Freybors <cat@domentoring>",
              to: user.name + ' <' + user.email + '>',
              subject: 'Your mentoring skills are required',
              text: body
            });
          } else if (tried === 1) {
            // couldn't find one, so we'll just grab the first
            User.findOne({ tags: tag }, success);
          } else {
            // give up
            next(new Error("Damnit, there isn't anyone in our DATABASE."));
          }
        };

        query.exec(success);
      }
    });
    res.render('asked');
  });

  app.get('/reply', function (req, res) {
    res.render('reply');
  });

  app.post('/reply', function (req, res) {
    res.render('reply');
  });
};