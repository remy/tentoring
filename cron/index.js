var CronJob = require('cron').CronJob;

var checkForUnanswered = require('./jobs/check-for-unanswered');
var updatePostponed = require('./jobs/update-postponed.js');

exports.checkForUnanswered = new CronJob({
  cronTime: '0 0 * * * *', // Every hour on the hour, every date, every month, every day
  onTick: checkForUnanswered,
  start: false
});

exports.updatePostponed = new CronJob({
  cronTime: '0 15 * * * *', // Every hour at quarter past
  onTick: updatePostponed,
  start: false
});
