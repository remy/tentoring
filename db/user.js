var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  email: { type: String, unique: true },
  name: String,
  mentor: Boolean,
  last_asked: Date,
  created: Date,
  tags: [String]
});

UserSchema.pre('save', function (next) {
  this.last_asked = this.created = new Date();
  next();
});

mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');