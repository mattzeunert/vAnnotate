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

	return 'Serialization of this variable failed.';
}
if (typeof exports !== 'undefined' && typeof require !== 'undefined'){
	exports.serializeLogResult = serializeLogResult;
}