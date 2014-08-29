var SendGrid = require('sendgrid').SendGrid;
var StubEmail = require('./stubemail').StubEmail;

var sendgrid = {
  username: process.env.SENDGRID_USERNAME,
  password: process.env.SENDGRID_PASSWORD
};

var useSendGrid = !!sendgrid.username && !!sendgrid.password;

module.exports = useSendGrid ? new SendGrid(sendgrid.username, sendgrid.password) : new StubEmail(__dirname + '/EMAILS');
