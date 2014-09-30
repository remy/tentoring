var CronJob = require('cron').CronJob;

var jobs = require('./jobs');

exports.checkForUnanswered = new CronJob({
  cronTime: '0 0 * * * *', // Every hour on the hour, every date, every month, every day
  onTick: jobs.checkForUnanswered,
  start: false
});

exports.updatePostponed = new CronJob({
  cronTime: '0 15 * * * *', // Every hour at quarter past
  onTick: jobs.updatePostponed,
  start: false
});
