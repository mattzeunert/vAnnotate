/*

Generic helper functions.

*/

exports.endsWith = function(str, ending){
	return  str.slice(str.length - ending.length) == ending;
}
