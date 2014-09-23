var CronJob = require('cron').CronJob;

var checkForUnanswered = require('../util/check-for-unanswered');

exports.checkForUnanswered = new CronJob({
  cronTime: '0 0 * * * *', // Every hour on the hour, every date, every month, every day
  onTick: checkForUnanswered,
  start: false
});
