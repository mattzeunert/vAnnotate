var index = require('./index')

describe('traverse parse tree', function(){
	var esprima = require('esprima');
	it('should traverse the tree and detect variable declarations', function(){
		var countVariableDeclarations = function(code){
			var parsed = esprima.parse(code),
				variableCount = 0;
			index.traverseParseTree(parsed, {
				'VariableDeclaration': function(){
					variableCount++;
				}
			});
			return variableCount;
		}

		var expectCount = function(code, count){
			expect(countVariableDeclarations(code)).toBe(count);
		}

		expectCount('var a;', 1);
		expectCount('var a; hello(); var b;', 2);

		expectCount('function a(){var a;}', 1);
		expectCount('(function(){var a})();', 1);
	})
});
