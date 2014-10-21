var express = require('express');

var Users = require('../models/Users');

var users = express.Router();
users.path = '/users';

users.post('/', function (req, res) {
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

  var userData = {
    name: req.body.name,
    email: req.body.email,
    orgs: [{
      org: req.org,
      skills: skills
    }]
  };

  Users.create(userData, function (err, user) {
    if (err && err.code !== 11000) {
      res.render('error', {
        message: 'Creating your user kinda blew up. Sorry, look for the cat to make things better.'
      });
    } else if (!user && err.code === 11000) {
      Users.findOne({email: userData.email}, function (err, user) {
        // TODO decide whether to update the user's skills
        // also check whether the user actually is in this org, and if not
        // add them in
        user.orgs = user.orgs || [];

        var addOrgToUser = user.orgs.map(function (item) {
          return item.org;
        }).indexOf(req.org) === -1;

        if (addOrgToUser) {
          user.orgs.push(userData.orgs[0]);
        }

        user.save();

        req.session.user = user;
        res.redirect(req.session.afterLogin || '/next');
      });
    } else {
      req.session.user = user;
      res.redirect('/next');
    }
  });
});

module.exports = users;
