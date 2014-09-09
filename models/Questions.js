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
  },
  asked: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    rejected: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

mongoose.model('Question', schema);
module.exports = mongoose.model('Question');