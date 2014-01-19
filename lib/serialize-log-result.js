function _countObjectProperties(obj){
	var count = 0;
	for (var key in obj){
		count ++;
	}
	return count;
}

var serializeLogResult = function(logResult){
	var type = typeof logResult;

	if (logResult === null){
		return 'null';
	}
	if (logResult === undefined){
		return 'undefined'
	}

	if (type === 'number' || type === 'boolean'){
		return logResult.toString();
	}

	if (type === 'string'){
		// Don't do anything for now, but we might need to maybe truncate the string in the future
		return logResult;
	}

	if (type === 'object'){
		return 'Object with ' + _countObjectProperties(logResult) + ' properties' + 
			'\n Converted to string: \"' + logResult.toString() + ' \"';

	}

	return 'Serialization of this variable failed.';
}

// This file is used both in the browser and in Node, so if it's in node export the necessary functions
if (typeof exports !== 'undefined' && typeof require !== 'undefined'){
	exports.serializeLogResult = serializeLogResult;
	exports._countObjectProperties = _countObjectProperties;
}