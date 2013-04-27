var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    uuid = require('connect').utils.uuid;

var QuestionSchema = new Schema({
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
    this.token = connect.utils.uuid();
  }
  next();
});

mongoose.model('Question', QuestionSchema);
module.exports = mongoose.model('Question');