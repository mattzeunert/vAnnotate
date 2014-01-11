/*

Generates the Html output containing the annotations.

*/

var fs = require('fs'),
	_ = require('underscore'),
	helper = require('./helper'),
	logInjector = require('./log-injector.js'),
	serverFs = require('./server-filesystem');

exports.generate = function(loggingSetup, results, code){
	loggingSetup = _.sortBy(loggingSetup, function(loggingItem){
		return loggingItem.range[0];
	});

	var output = '';
	var codeIndex = 0;
	loggingSetup.forEach(function(loggingItem){
		output += code.substring(codeIndex, loggingItem.range[0])	
		console.log('each')
		output += '<div class="annotated-element" data-annotation-value="' + 
			helper.htmlEscapeQuotes(results[loggingItem.id])
			+ '">';
		output +=  code.substring(loggingItem.range[0], loggingItem.range[1])
		output += '</div>';
		codeIndex = loggingItem.range[1];
	});
	output += code.substring(codeIndex, code.length)

	console.log(output)
	return output;
	
}