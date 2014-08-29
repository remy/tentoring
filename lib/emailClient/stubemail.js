var fs = require('fs');
var Email = require('./Email.js');

var StubEmail = function StubEmail () {

};

StubEmail.prototype.Email = Email;

StubEmail.prototype.send = function (email, callback) {
  if (email instanceof Email) {
    email = Email.toObject();
  }
  email.date = email.date || Date.now();
  fs.writeFile(this.directory + '/' + email.to + '-' + email.date.toString(), email.body, callback);
};

module.exports.StubEmail = StubEmail;
