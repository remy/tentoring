'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  email: { type: String, unique: true },
  name: String,
  created: { type: Date, default: Date.now },
  orgs: [{
    org: {
      required: true,
      type: ObjectId,
      ref: 'Org'
    },
    skills: [String],
    asked: { type: Date, default: Date.now },
    mentor: { type: Boolean, default: false }
  }]
});

mongoose.model('User', schema);
module.exports = mongoose.model('User');