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
		var logResult;
		if (results){
			logResult = results[loggingItem.id]
      if (logResult === undefined){
        logResult = 'No annotation for this variable... maybe it wasn\'t used?';
      }
		}
		else {
			logResult = 'No annotation data for this Javascript file, make sure to open the page that uses the JS.';
		}

		output += code.substring(codeIndex, loggingItem.range[0])
		output += '<div class="annotated-element" data-annotation-value="' +
			helper.htmlEscapeQuotes(logResult).replace('\n', '<br>')
			+ '">';
		output +=  code.substring(loggingItem.range[0], loggingItem.range[1])
		output += '</div>';
		codeIndex = loggingItem.range[1];
	});
	output += code.substring(codeIndex, code.length)

	return output;

}
