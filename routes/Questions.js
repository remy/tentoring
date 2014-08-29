var express = require('express');

var Questions = require('../models/Questions');
var Users = require('../models/Users');

var email = require('../lib/email');

var questions = express.Router();

// TODO make sure all these routes require auth

questions.param('token', function (req, res, next) {
  Questions
    .findOne({ token: req.params.token })
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
  var now = Date.now();

  var body = {
    text: req.body.question,
    by: req.session.user._id,
    skill: req.body.skill
  };

  Questions
    .create(body)
    .exec(function (err, question) {

      if (err) {
        return next(err);
      }

      Users
        .findOne({
          'orgs.skills': question.skill,
          'orgs.org': req.org._id
        })
        .where('orgs.asked').lt(now)
        .ne('email', req.query.email)
        .exec(userCallback);

      function userCallback (err, user) {

        if (err || !user) {
          return next(err);
        }

        user.asked = now;
        user.save();

        email.sendQuestion({
          user: user,
          question: question
        });

        // TODO: This should redirect to
        // http://tentoring.dev/questions/:questionid
        res.render('asked');

      }

    });
});

questions.get('/:token', function (req, res, next) {
});

module.exports = questions;
