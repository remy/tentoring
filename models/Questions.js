'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    crypto = require('crypto');

var createToken = function () {
  return crypto.createHash('sha1').update(Date.now()+'').digest('hex').substr(0,6);
};

var schema = new Schema({
  event: {
    type: ObjectId,
    ref: 'Event'
  },
  created: {
    type: Date,
    default: Date.now
  },
  text: String,
  token: {
    type: String,
    default: createToken
  },
  by: {
    type: ObjectId,
    ref: 'User'
  },
  tag: String,
  answered: { type: Boolean, default: false },
  reply: {
    by: {
      type: ObjectId,
      ref:  'User'
    },
    text: String
  }
});

schema.pre('save', function (next) {
  if (!this.token) {
    this.token = crypto.createHash('sha1').update(Date.now()+'').digest('hex').substr(0,6);
  }

  this.created = new Date();
  next();
});

mongoose.model('Question', schema);
module.exports = mongoose.model('Question');