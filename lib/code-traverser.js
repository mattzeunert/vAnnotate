/*

Finds elements in the parse tree and allows 

*/

var esprima = require('esprima'),
    escodegen = require('escodegen');

/*
    These functions can be used as handler conditions passed to traverseParseTree.
*/
exports.conditions = {
    isAssignment: function(treeElement){
        return treeElement.type == 'ExpressionStatement'
                && treeElement.expression.type == 'AssignmentExpression';
    },
    isFunctionDeclaration: function(treeElement){
        return treeElement.type === 'FunctionDeclaration'
    },
    isVariableDeclaration: function(treeElement){
        return treeElement.type === 'VariableDeclaration'
    },
    isReturnStatement: function(treeElement){
        return treeElement.type === 'ReturnStatement';
    }
}

/*
    These are used to find nested instructions.
*/
var parseNestingChildren = [
    'body',
    'expression',
    'callee',
    'consequent'
];

/* 
    Recursively go through elements of the parse tree.

    Handlers is a list of objects like this:
    {condition: function(){}, handle: function(){}}
    If condition returns true the handler is invoked with the current
    element of the parse tree.

    If a handler adds a modify property to the treeElement the function
    will update the parent.
    Currently supported are 'after', 'remove', and 'toBody'

    For example: treeElement.modify = {after: [ esprima.parse('var a') ] }

*/
var traverseParseTree = function(treeElement, handlers){
    var isArray = !!treeElement.length,
        recurse = function(treeElement){
            traverseParseTree(treeElement, handlers)
        };

    handlers.forEach(function(handler){
        if (handler.condition(treeElement)){
            handler.handle(treeElement);
        }
    });

    if (isArray) {
        for (var i=0; i<treeElement.length; i++){
            recurse(treeElement[i]);
            var modify = treeElement[i].modify;
            if (modify) {
                if (modify.remove){
                    treeElement.splice(i, 1);
                    i--;
                }
                if (modify.after){
                    modify.after.reverse().forEach(function(instruction){
                        treeElement.splice(i + 1, 0, instruction)
                    });
                    i += modify.after.length;
                }
                if (modify.toBody){
                    modify.toBody.forEach(function(instruction){
                        treeElement[i].body.body.unshift(instruction);
                    });
                }
                

                if (!modify.remove){
                    treeElement[i].modify = undefined;
                }
            }
            
        }
    }
    else {
        // Check if it has properties that contain arrays of instructions 
        // we can iterate over later
        var handledElement = false;
        for (var i=0; i<parseNestingChildren.length; i++){
            var child = parseNestingChildren[i].toString();
            if (treeElement[child]){
                recurse(treeElement[child]);
                handledElement = true;
                break;
            }
        }
        if (!handledElement) {
            // TODO: make sure all nested elements are handled where it's necessary
            // might mean some changes to parseNestingChildren
        }

    }
}

exports.traverseParseTree = traverseParseTree;