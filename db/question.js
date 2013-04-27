var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    crypto = require('crypto');

var QuestionSchema = new Schema({
  created: Date,
  text: String,
  token: String,
  by: {
    type: ObjectId,
    ref:  'User'
  },
  tag: String,
  reply: {
    by: {
      type: ObjectId,
      ref:  'User'
    },
    text: String
  }
});

QuestionSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = crypto.createHash('sha1').update(Date.now()+'').digest('hex').substr(0,6);
  }

  this.created = new Date();
  next();
});

mongoose.model('Question', QuestionSchema);
module.exports = mongoose.model('Question');