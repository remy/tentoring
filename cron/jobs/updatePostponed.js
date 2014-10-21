var fs = require('fs');
var path = require('path');

var hbs = require('hbs');

var Questions = require('../../models/Questions');
var Users = require('../../models/Users');

var emailClient = require('../../lib/emailClient');

var emailDir = path.join(__dirname + '/../../views/emails');

var reminderEmailTemplate = hbs.handlebars.compile(fs.readFileSync(emailDir + '/email-reminder.hbs').toString());

module.exports = function (app) {

  var email = {
    sendQuestion: function (options) {
      options.settings = app.settings;
      var content = reminderEmailTemplate(options);
      emailClient.send({
        to: options.user.email,
        from: 'mail@tentoring.com',
        subject: 'Reminder about postponed question',
        text: content
      });
    }
  };

  var updatePostponed = function () {

    var today = new Date((new Date()).toDateString());

    Questions.find({
      postponed: true,
      postponedTo: {
        $eq: today
      }
    }).exec(function (err, questions) {
      if (err) {
        return err;
      }

      questions.forEach(function (question) {

        var user = question.asked.filter(function (user) {
          return !user.rejected;
        })[0];

        Users.findOne({
          _id: user
        }, function (err) {
          if (err) {
            return;
          }
          email.sendReminder({
            user: user,
            question: question
          });
          question.postponed = false;
          question.save();
        });

      });

    });

  };

  return updatePostponed;

};
