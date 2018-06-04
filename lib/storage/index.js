var mongoose = require('mongoose');
const { DatabasebUrl, DatabasebUrlTest } = require('./../config');
var History   = require('./history');
var Publisher = require('./publisher');
var inviteLog = require('./invite_log');

var db = process.env.NODE_ENV == 'test' ? DatabasebUrlTest : DatabasebUrl;

mongoose.Promise = Promise;
mongoose.connect(db, function(err) {
  if (err) {
    console.error('connect to %s error: ', db, err.message);
    process.exit(1);
  }
});

module.exports = {
  Publisher,
  inviteLog,
  History
}