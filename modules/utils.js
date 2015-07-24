exports.uid = function(len) {
    var buffer = [];
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i = 0; i < len; ++i) {
        var rand = Math.floor(Math.random() * (chars.length + 1));
        buffer.push(chars[rand]);
    }

    return buffer.join('');
};


exports.moment2mysql = function(mom) {
	return mom.format('YYYY-MM-DD HH:mm:ss');
}