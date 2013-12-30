/*

Uses codeTraverser to detect variable assignments etc and inject
logging code.

*/

var esprima = require('esprima'),
	escodegen = require('escodegen'),
	codeTraverser = require('./code-traverser'),
	fs = require('fs'),
	path = require('path');


var createLoggingCall = function(id, value){
	return esprima.parse('window.vAnnotate.log(' + id + ', ' + value + ')')
}

/*
	Injection function that returns both the updated code and
	a list of places where code was injected.
*/
var _injectLogging = function(fileId, code){
    var parsed = esprima.parse(code, {range: true}),
    	id = 0,
    	logging = [];



    codeTraverser.traverseParseTree(parsed, [
    	{
	        condition: codeTraverser.conditions.isAssignment,
	        handle: function(treeElement){
	            treeElement.modify = {            	
	                after: [ createLoggingCall(id, treeElement.expression.left.name)]
	            };
	            logging.push({
	            	id: id,
	            	range: treeElement.expression.left.range
	            });
	            id++;
	        }
	    },
	    {
	    	condition: codeTraverser.conditions.isFunctionDeclaration,
	    	handle: function(treeElement){
	    		var logInstructions = [];
	    		treeElement.params.forEach(function(param){
	    			logInstructions.push(createLoggingCall(id, param.name));
	    			logging.push({
		            	id: id,
		            	range: param.range
		            });
		            id++;
	    		})

	    		treeElement.modify = {
	    			toBody: logInstructions
	    		}
	    		
	    	}
	    }
    ]);

    var browserCodePath = path.resolve(__dirname, 'vAnnotate-browser.js');
    var browserCode = fs.readFileSync(browserCodePath).toString();
    browserCode = browserCode.replace('{{fileId}}', fileId)
    
    parsed.body.unshift(esprima.parse(browserCode));
	var newCode = escodegen.generate(parsed);

	return {
		code: newCode,
		logging: logging
	};
}

/*
	Returns code with injected logging calls.
*/
exports.injectLogging = function(fileId, code){
	return _injectLogging(fileId, code).code;
};

/*
	The logging setup is an array that keeps track of code injections.
	Individual items look like this: 
	{id: 333, range: [56,60]}
	The id identifies the injection (allowing it to be matched to reported
	log values) and the range contains the start and end index of the 
	annotated code inside its file.
*/
exports.getLoggingSetup = function(fileId, code){
	return _injectLogging(fileId, code).logging;
}