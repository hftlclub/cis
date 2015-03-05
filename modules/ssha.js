var crypto = require('crypto');
 
/*
 * node.js ssha hash generation and check functions intended for use with LDAP servers.
 * https://gist.github.com/itorres/2947088
 */
 
exports.ssha = function(cleartext, salt) {
  var sum = crypto.createHash('sha1');
  ( typeof(salt) == 'undefined') ? salt = new Buffer(crypto.randomBytes(20)).toString('base64') : salt = salt;
  sum.update(cleartext);
  sum.update(salt);
  var digest = sum.digest();
  var ssha = '{SSHA}' + new Buffer(digest+salt,'binary').toString('base64');
  return ssha;
}
 
exports.checkssha = function(cleartext, hash) {
  var sum = crypto.createHash('sha1');
  if (hash.substr(0,6) != '{SSHA}') {
    console.error("Not a SSHA hash");
    return false;
  }
  var bhash = new Buffer(hash.substr(6),'base64');
  var salt  = bhash.toString('binary',20);
  var newssha = this.ssha(cleartext,salt);
  return (hash == newssha);
}