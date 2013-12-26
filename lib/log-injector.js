var esprima = require('esprima'),
	escodegen = require('escodegen'),
	codeTraverser = require('./code-traverser'),
	fs = require('fs'),
	path = require('path');

exports.injectLogging = function(code){
    var parsed = esprima.parse(code);
    var id = 0;
    codeTraverser.traverseParseTree(parsed, [{
        condition: codeTraverser.conditions.isAssignment,
        handle: function(treeElement){
            treeElement.modify = {            	
                after: [ esprima.parse('window.vAnnotate.log(' + id++ + ', ' + treeElement.expression.left.name + ')') ]
            }
        }
    }]);

    var browserCodePath = path.resolve(__dirname, 'vAnnotate-browser.js');
    var browserCode = fs.readFileSync(browserCodePath).toString();
    parsed.body.unshift(esprima.parse(browserCode));
	var newCode = escodegen.generate(parsed);

	return newCode;
}