var fs = require('fs'),
	_ = require('underscore'),
	helper = require('./helper');

exports.generate = function(file, loggingSetup, results){
	var code = fs.readFileSync('./site/' + file).toString();

	loggingSetup = _.sortBy(loggingSetup, function(loggingItem){
		return loggingItem.range[0];
	});

	var output = '';
	var codeIndex = 0;
	loggingSetup.forEach(function(loggingItem){
		output += code.substring(codeIndex, loggingItem.range[0])	
		output += '<div class="annotated-element" data-annotation-value="' + 
			results[loggingItem.id]
			+ '">';
		output +=  code.substring(loggingItem.range[0], loggingItem.range[1])
		output += '</div>';
		codeIndex = loggingItem.range[1];
	});
	output += code.substring(codeIndex, code.length)

	console.log(output)
	return output;
}