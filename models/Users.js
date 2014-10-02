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
      type: ObjectId,
      ref: 'Org'
    },
    skills: [String],
    asked: { type: Date, default: Date.now },
    mentor: { type: Boolean, default: false }
  }],
  globalAdmin: {
    type: Boolean,
    default: false
  }
});

schema.static('findByOrg', function (id, callback) {
  return this.find({ orgs: { orgs: id } }, callback);
});

mongoose.model('User', schema);
module.exports = mongoose.model('User');

