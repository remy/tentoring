var User = require('../db/User');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('home');
  });

  app.post('/user', function (req, res) {
    var user = new User(req.body.user, function (err) {
      if (err) {
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
};