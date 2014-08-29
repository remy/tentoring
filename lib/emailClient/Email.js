var Email = function Email (opts) {
  this.opts = opts;
  if (this.opts.to.constructor !== Array) {
    this.opts.to = [opts.to];
  }
};

Email.prototype = {
  toObject: function () {
    return this.opts;
  }
};

module.exports = Email;
