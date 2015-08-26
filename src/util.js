var chalk = require('chalk');

var defaults = {
  loglevel: 1,
  prefix: '[cpwanted]',
  showDate: false
};

function Util() {
  var options = arguments || {};
  this.loglevel = options.loglevel || defaults.loglevel;
  this.prefix = options.prefix || defaults.prefix;
  this.showDate = options.showDate || defaults.showDate;
}

function getDate() {
  var now = (new Date()).toString().split(' ');
  return now[2] + ' ' + now[1] + ' ' + now[4] + ' - ';
}

Util.prototype.setLoglevel = function(val) {
  this.loglevel = val === undefined ? defaults.loglevel : val;
};

Util.prototype.log = function() {
  var results = [];
  var dates = this.showDate ? getDate() : '';

  for (var i = 0; i < arguments.length; i++) {
    results.push(arguments[i]);
  }

  console.log(dates + chalk.green(this.prefix, '%s'), results.join(' '));
};

Util.prototype.verbose = function() {
  if (this.loglevel === 0) {
    this.log.apply(this, arguments);
  }
};

Util.prototype.stringify = function(json) {
  console.log(JSON.stringify(json, null, '  '));
};

Util.prototype.stdout = function() {
  console.log.apply(this, arguments);
};

exports['default'] = Util;
module.exports = exports['default'];
