var when = require('when');
var mongoose = require('mongoose'),
    db = mongoose.connection,
    mongourl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/tentoring';
var Orgs = require('../models/Orgs');
var Users = require('../models/Users');
var Questions = require('../models/Questions');

mongoose.connect(mongourl);

Questions.find({
  org: { $exists: false }
}, function (error, results) {
  results.forEach(function (question) {
    Users.findById(question.by, function (error, user) {
      if (error || !user) {
        question.remove(); // it's an old test question
        return console.log('User not found: %s', question._id);
      }

      if (!user.orgs || user.orgs.length === 0) {
        user.orgs = [{
          org: '533b3cebe77a340200000003',
          skills: user.tags,
        }];
        delete user.tags;
        user.save();
        // return console.log('User has no orgs: %s', user._id)
      }

      if (user.orgs.length > 1) {
        if (user.id === '517c3e831342300200000004') {

        } else {
          console.log('User multiple orgs: %s', user._id);
        }
      }

      question.org = user.orgs[0].org;
      question.save();
      console.log('done question %s', question._id);
    })
  });

});