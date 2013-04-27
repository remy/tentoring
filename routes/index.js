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
      if (err && !user) {
        res.render('error', {
          message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.'
        });
      } else {
        res.render('user-created');
      }
    });
  });

  app.get('/ask', function (req, res) {
    res.render('ask');
  });

  app.post('/post', function (req, res) {
    var tag = req.body.question.tag,
        now = Date.now();
    var question = new Question(req.body.question, function (err, question) {
      if (!err) {
        // find a mentor that matches the tag
        var query = User.findOne({ tags: tag });
        query.sort({ last_asked: { $lt: now } });
        query.exec(function (err, user) {
          if (user) {
            user.last_asked = now;
            user.save();

            var body = template({
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
          }
        });
      }
    }).save();
    res.render('ask');
  });

  app.get('/reply', function (req, res) {
    res.render('reply');
  });

  app.post('/reply', function (req, res) {
    res.render('reply');
  });
};