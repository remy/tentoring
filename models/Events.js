var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  slug: { required: true, type: String, index: true },
  created: { type: Date, default: Date.now },
  dates: {
    from: Date,
    to: Date
  },
  config: {
    title: String,
    css: String,
    skills: [String]
  }
});

mongoose.model('Event', schema);
module.exports = mongoose.model('Event');