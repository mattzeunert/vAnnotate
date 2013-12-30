/*

Generic helper functions.

*/

exports.endsWith = function(str, ending){
	return  str.slice(str.length - ending.length) == ending;
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