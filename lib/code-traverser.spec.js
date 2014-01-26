var codeTraverser = require('./code-traverser')

describe('traverse parse tree', function(){
    var esprima = require('esprima'),
        escodegen = require('escodegen');

    var countVariableDeclarations = function(code){
        var parsed = esprima.parse(code),
            variableCount = 0;
        codeTraverser.traverseParseTree(parsed, [
                {
                    condition: function(treeElement){
                        return treeElement.type == 'VariableDeclaration';
                    },
                    handle: function(){
                        variableCount++;
                    }
                }
            ]
        );
        return variableCount;
    }

    var expectCount = function(code, count){
        expect(countVariableDeclarations(code)).toBe(count);
    }

    it('should traverse the tree and detect variable declarations', function(){
        expectCount('var a;', 1);
        expectCount('var a; hello(); var b;', 2);

        expectCount('function a(){var a;}', 1);
        expectCount('(function(){var a})();', 1);
    })

    it('should traverse the tree and detect assignments', function(){
        var code = 'var a;a=5;',
            parsed = esprima.parse(code),
            assigmentCount = 0;
        codeTraverser.traverseParseTree(parsed, [
                {
                    condition: codeTraverser.conditions.isAssignment,
                    handle: function(){
                        assigmentCount++;
                    }
                }
            ]
        );
        expect(assigmentCount).toBe(1);
    });

    it('should allow you to insert tree elements', function(){
        var code = 'a = 2;';
        var parsed = esprima.parse(code);
        codeTraverser.traverseParseTree(parsed, [{
            condition: codeTraverser.conditions.isAssignment,
            handle: function(treeElement){
                treeElement.modify = {
                    after: [ esprima.parse('var a') ]
                }
            }
        }]);
        var newCode = escodegen.generate(parsed);

        expect(newCode).toBe('a = 2;\nvar a;');
    })
});
