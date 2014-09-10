'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

var Orgs = require('../models/Orgs');


module.exports = function (app) {
    // middleware to ensure the right organisation group is attached
  app.use(function (req, res, next) {
    var cname = req.subdomains.length ? req.subdomains.join('.') : 'tentoring';

    Orgs.findOne({ slug: cname }, function (error, result) {
      if (error) {
        return next(error);
      }

      if (result) {
        req.org = result;
        return next();
      } else {
        console.log(req);
        res.redirect(req.protocol + '://' + app.settings.root);
      }
    });
  });

  app.use(function (req, res, next) {
    var render = res.render.bind(res);
    res.render = function (view, data) {
      if (data instanceof mongoose.Document) {
        data = data.toObject();
      }
      var boundData = _.extend({}, req.org.config, data || {});
      return render(view, boundData);
    };
    next();
  });

};