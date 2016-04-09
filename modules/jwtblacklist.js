//token blacklist is filled on logout so that tokens are no longer used after logout
var blacklist = {};


exports.add = function(token) {
    blacklist[token] = true;
    return true;
}

exports.find = function(token) {
    return blacklist.hasOwnProperty(token);
}
