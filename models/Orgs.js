'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  owner: {
    type: ObjectId,
    ref:  'User'
  },
  slug: { required: true, type: String, index: true },
  domain: String,
  created: { type: Date, default: Date.now },
  config: {
    title: String,
    css: String,
    skills: [String],
    email: {
      from: String,
      subject: String,
      template: {
        question: String,
        reply: String
      }
    }
  },
  events: [{ type: ObjectId, ref: 'Event' }],
});

schema.pre('save', function (next) {
  this.config.skills = this.config.skills.sort(function (a, b) {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  });

  next();
});

mongoose.model('Org', schema);
module.exports = mongoose.model('Org');