var fs = require('fs');
var path = require('path');

var express = require('express');
var hbs = require('hbs');
var marked = require('marked');

var Questions = require('../models/Questions');
var Users = require('../models/Users');

var emailClient = require('../lib/emailClient');

var emailDir = path.join(__dirname + '/../views/emails');

var questionEmailTemplate = hbs.handlebars.compile(fs.readFileSync(emailDir + '/email-question.hbs').toString());
var replyEmailTemplate = hbs.handlebars.compile(fs.readFileSync(emailDir + '/email-reply.hbs').toString());

var email = {
  sendQuestion: function (options) {
    var content = questionEmailTemplate(options);
    emailClient.send({
      to: options.user.email,
      from: 'mail@tentoring.com',
      subject: 'Your mentoring skills are required',
      text: content
    });
  },
  sendReply: function (options) {
    var content = replyEmailTemplate(options);
    emailClient.send({
      to: options.user.email,
      from: 'mail@tentoring.com',
      subject: 'Your question has been answered',
      text: content
    });
  }
};

var questions = express.Router();
questions.path = '/questions';

// TODO make sure all these routes require auth

questions.param('token', function (req, res, next) {
  Questions
    .findOne({
      token: req.params.token
    })
    .populate('by')
    .exec(function (err, question) {
      // TODO: handle no question with 404
      if (err) {
        return next(err);
      }
      req.question = question;
      next();
    });
});

questions.post('/', function (req, res, next) {
  var questionData = {
    text: req.body.question,
    by: req.session.user._id,
    skill: req.body.skill
  };

  Questions
    .create(questionData, function (err, question) {
      if (err) {
        return next(err);
      }
      console.log(question);
      req.question = question;
      next();
    });

}, function (req, res, next) {
  var now = Date.now();
  console.log(req.org);
  Users
    .findOne({
      'orgs.skills': req.question.skill,
      'orgs.org': req.org._id
    })
    .where('orgs.asked').lt(now)
    .ne('email', req.session.user.email)
    .exec(function (err, user) {
      if (err || !user) {
        return res.render('error', {
          message: 'Annoyingly there isn\'t anyone available for that skill just yet, but hold on tight, more mentors are coming!'
        });
      }

      user.asked = now;
      user.save();

      req.question.asked.push({
        user: user._id,
      });
      req.question.save();

      email.sendQuestion({
        user: user,
        question: req.question
      });

      // TODO: This should redirect to
      // http://tentoring.dev/questions/:questionid
      res.render('asked');

    });
});

questions.get('/:token', function (req, res, next) {
  var user = req.session.user;
  if (req.question) {
    if (req.question.by._id === user.id) {
      // Then the question was asked by this user
      if (req.question.answered) {
        // Render the question with answer
      } else {
        // Render the question and let them
        // know it's still no answered.
      }
      next();
    } else {
      if (req.question.answered) {
        if (user.id === req.question.answerer._id) {
          res.render('thank-you', req.question);
        } else {
          // TODO what to render??
          req.question.text_md = marked(req.question.text);
          res.render('reply', req.question.toObject());
        }
      } else {
        // TODO use a markdown helper in handlebars instead of doing here
        req.question.text_md = marked(req.question.text);
        res.render('reply', req.question.toObject());
      }
    } 
  } else {
    res.render('error', {
      message: 'Sorry, I couldn\'t find your question, but I found this cat instead',
      title: 'It went wrong'
    });
  }
});

questions.put('/:token', function (req, res, next) {
  if (!req.question) {
    return res.render('error', {
      message: 'Sorry, I couldn\'t find your question, but I found this cat instead',
      title: 'It went wrong'
    });
  }
  if (req.query.reject) {
    var now = Date.now();
    var rejectedItem = req.question.asked.filter(function (item) {
      return item.user.equals(req.session.user._id) && item.rejected === false;
    })[0];
    if (!rejectedItem) {
      return res.send(403);
    }
    rejectedItem.rejected = true;
    Users
      .findOne({
        'orgs.skills': req.question.skill,
        'orgs.org': req.org._id
      })
      .where('orgs.asked').lt(now)
      .ne('email', req.session.user.email)
      .nin('_id', req.question.asked.map(function (item) {
        return item.user;
      }))
      .exec(function (err, user) {
        if (err || !user) {
          req.question.save();
          return res.render('error', {
            message: 'Annoyingly there isn\'t anyone available for that skill just yet, but hold on tight, more mentors are coming!'
          });
        }

        // TODO - this is redundant
        user.asked = now;
        user.save();

        req.question.asked.push({
          user: user._id,
        });
        req.question.save();

        email.sendQuestion({
          user: user,
          question: req.question
        });

        // TODO: This should redirect to
        // http://tentoring.dev/questions/:questionid
        res.render('asked');

      });
  }
  else if (req.body.reply) {
    req.question.reply = {
      by: req.session.user._id,
      text: req.body.reply
    };
    req.question.answered = true;
    req.question.save();

    email.sendReply({
      user: req.session.user,
      question: req.question
    });

    res.render('thank-you', req.question);
  }
});

module.exports = questions;
