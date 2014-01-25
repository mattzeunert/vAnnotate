/*

Generic helper functions.

*/

var crypto = require('crypto');

exports.endsWith = function(str, ending){
	return  str.slice(str.length - ending.length) == ending;
}

exports.htmlEscapeQuotes = function(str){
	str = str.replace(/"/g, '&quot;');
	str = str.replace(/'/g, '&#39;');
	return str;
}

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
exports.guid = function(){
	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
	             .toString(16)
	             .substring(1);
	};

	return s4() + s4() + s4() + s4() +
	         s4()  + s4() + s4() + s4();
}

exports.sha1 = function(str){
	var hash = crypto.createHash('sha1');
	hash.update(str);
	return hash.digest('hex');
}
