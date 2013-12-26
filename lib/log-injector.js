var esprima = require('esprima'),
	escodegen = require('escodegen'),
	codeTraverser = require('./code-traverser'),
	fs = require('fs'),
	path = require('path');

exports.injectLogging = function(code){
    var parsed = esprima.parse(code, {range: true}),
    	id = 0,
    	logging = [];
    codeTraverser.traverseParseTree(parsed, [{
        condition: codeTraverser.conditions.isAssignment,
        handle: function(treeElement){
            treeElement.modify = {            	
                after: [ esprima.parse('window.vAnnotate.log(' + id + ', ' + treeElement.expression.left.name + ')') ]
            };
            logging.push({
            	id: id,
            	range: treeElement.expression.left.range
            });
            id++;
        }
    }]);

    var browserCodePath = path.resolve(__dirname, 'vAnnotate-browser.js');
    var browserCode = fs.readFileSync(browserCodePath).toString();
    parsed.body.unshift(esprima.parse(browserCode));

	var newCode = escodegen.generate(parsed);

	return {
		code: newCode,
		logging: logging
	};
}