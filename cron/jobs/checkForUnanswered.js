var fs = require('fs');
var path = require('path');

var hbs = require('hbs');

var Users = require('../../models/Users');
var Questions = require('../../models/Questions');

var emailClient = require('../../lib/emailClient');

var emailDir = path.join(__dirname + '/../../views/emails');

var questionEmailTemplate = hbs.handlebars.compile(fs.readFileSync(emailDir + '/email-question.hbs').toString());
var replyEmailTemplate = hbs.handlebars.compile(fs.readFileSync(emailDir + '/email-reply.hbs').toString());

module.exports = function (app) {

  var email = {
    sendQuestion: function (options) {
      options.settings = app.settings;
      var content = questionEmailTemplate(options);
      emailClient.send({
        to: options.user.email,
        from: 'mail@tentoring.com',
        subject: 'Your mentoring skills are required',
        text: content
      });
    },
    sendReply: function (options) {
      options.settings = app.settings;
      var content = replyEmailTemplate(options);
      emailClient.send({
        to: options.user.email,
        from: 'mail@tentoring.com',
        subject: 'Your question has been answered',
        text: content
      });
    }
  };

  var cutoffDate =  new Date(Date.parse('2014-10-21'));

  var emailUnanswered = function () {

    Questions
    .find({
      answered: false,
      created: {
        $gte: cutoffDate
      }
    })
    .ne('asked.rejected', false)
    .exec(function (err, questions) {
      questions.forEach(function (question) {
        question.asked = question.asked || [];

        Users
        .findOne({
          'orgs.skills': question.skill,
          'orgs.org': question.org
        })
        .nin('_id', question.asked.map(function (item) {
          return item.user;
        }))
        .exec(function (err, user) {
          if (err || !user) {
            question.save();
            return;
          }

          question.asked.push({
            user: user._id,
          });
          question.save();

          email.sendQuestion({
            user: user,
            question: question
          });

        });
      });
    });
  };
  return emailUnanswered;
};
