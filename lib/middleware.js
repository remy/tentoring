'use strict';

var Org = require('../db/org');


module.exports = function (app) {
    // middleware to ensure the right organisation group is attached
  app.use(function (req, res, next) {
    var cname = req.subdomains.length ? req.subdomains.join('.') : 'tentoring';

    Org.findOne({ slug: cname }, function (error, result) {
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


};