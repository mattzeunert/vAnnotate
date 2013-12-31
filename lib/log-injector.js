/*

Uses codeTraverser to detect variable assignments etc and inject
logging code.

*/

var esprima = require('esprima'),
	escodegen = require('escodegen'),
	codeTraverser = require('./code-traverser'),
	fs = require('fs'),
	path = require('path'),
	helper = require('./helper');


var createLoggingCall = function(id, value){
	return esprima.parse('window.vAnnotate.log(' + id + ', ' + value + ')')
}
/* 
	Function to create a return statement since we can't just pass 'return varName'
	to Esprima because it's invalid (return is only valid inside a function)
*/
var createReturnStatement = function(returnVariableName){
	return {
        type: 'ReturnStatement',
        'argument': {
            'type': 'Identifier',
            'name': returnVariableName
        }
    }
}


/*
	Injection function that returns both the updated code and
	a list of places where code was injected.
*/
var _injectLogging = function(code){
    var parsed = esprima.parse(code, {range: true}),
    	id = 0,
    	logging = [];

    console.log(',,,',code, arguments, fileId)
    var fileId = helper.sha1(code);


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
	    			prependToBody: logInstructions
	    		}
	    		
	    	}
	    },
	    {
	    	condition: codeTraverser.conditions.isVariableDeclaration,
	    	handle: function(treeElement){
	    		var logInstructions = [];
	    		treeElement.declarations.forEach(function(declaration){
	    			logInstructions.push(createLoggingCall(id, declaration.id.name));
	    			logging.push({
		            	id: id,
		            	range: declaration.id.range
		            });
		            id++;
	    		})

	    		treeElement.modify = {
	    			after: logInstructions
	    		}
	    		
	    	}
	    },
	    {
	    	condition: codeTraverser.conditions.isReturnStatement,
	    	handle: function(treeElement){
	    		var returnArgument = treeElement.argument;
	    		var returnVariableName = 'vAnnotateReturn_' + helper.guid();
	    		var returnValue = esprima.parse('var ' + returnVariableName + ' = null');
	    		var returnStatement = createReturnStatement(returnVariableName);

	    		returnValue.body[0].declarations[0].init = returnArgument;

	    		treeElement.modify = {            	
	                after: [ returnValue, createLoggingCall(id, returnVariableName), returnStatement],
	                remove: true
	            };
	            logging.push({
	            	id: id,
	            	range: [treeElement.range[0], treeElement.range[0] + 'return'.length]
	            });
	            id++;
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
exports.injectLogging = function(code){
	return _injectLogging(code).code;
};

/*
	The logging setup is an array that keeps track of code injections.
	Individual items look like this: 
	{id: 333, range: [56,60]}
	The id identifies the injection (allowing it to be matched to reported
	log values) and the range contains the start and end index of the 
	annotated code inside its file.
*/
exports.getLoggingSetup = function(code){
	return _injectLogging(code).logging;
}