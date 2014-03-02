/*

Finds elements in the parse tree and allow code injectino.

The traverser aims to run through all functions in a source tree so their code can be modified.

*/

var esprima = require('esprima'),
    escodegen = require('escodegen');

/*
    These functions can be used as handler conditions passed to traverseParseTree.
*/
var conditions = {
    isAssignment: function(treeElement){
        return treeElement.type === 'AssignmentExpression';
    },
    isExpression: function(treeElement){
        return treeElement.type === 'ExpressionStatement';
    },
    isFunctionDeclaration: function(treeElement){
        return treeElement.type === 'FunctionDeclaration';
    },
    isFunctionExpression: function(treeElement){
        return treeElement.type === 'FunctionExpression';
    },
    isFunction: function(treeElement){
        return (
            conditions.isFunctionExpression(treeElement)
            ||
            conditions.isFunctionDeclaration(treeElement)
        );
    },
    isVariableDeclaration: function(treeElement){
        return treeElement.type === 'VariableDeclaration'
    },
    isReturnStatement: function(treeElement){
        return treeElement.type === 'ReturnStatement';
    },
    isObjectExpression: function(treeElement){
        return treeElement.type === 'ObjectExpression';
    },
    isCallExpression: function(treeElement){
        return treeElement.type === 'CallExpression';
    },
    isMemberExpression: function(treeElement){
        return treeElement.type === 'MemberExpression';
    }
}
exports.conditions = conditions;

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
    Some if statements don't have a body, like this:
    if (sth) doStuff();
    Instead of:
    if (sth) {doStuff();}
    This function makes sure all if statements have a body.
*/
var convertIfStatementToUseBlockStatement = function(ifStatement){
    console.log('');console.log('');console.log('');console.log('');console.log('');
    console.log(ifStatement);
    console.log('');console.log('');console.log('');

    if (ifStatement.consequent.type !== "BlockStatement"){
        // Something like `if (sth) return`
        // We don't like this because we can't modify the body without turning it into a
        // block expression, so let's just do that now
        var nonBlockStatement = ifStatement.consequent;
        ifStatement.consequent = {
            type: "BlockStatement",
            body: [nonBlockStatement]
        }
    }
}

/*
    Recursively go through elements of the parse tree.

    Handlers is a list of objects like this:
    {condition: function(){}, handle: function(){}}
    If condition returns true the handler is invoked with the current
    element of the parse tree.

    If a handler adds a modify property to the treeElement the function
    will update the parent.
    Currently supported are 'after', 'remove', and 'prependToBody'

    For example: treeElement.modify = {after: [ esprima.parse('var a') ] }

*/
var traverseParseTree = function(treeElement, handlers){
    var isArray = !!treeElement.length,
        isVariableDeclaration = conditions.isVariableDeclaration(treeElement),
        isCallExpression = conditions.isCallExpression(treeElement),
        isAssignment = conditions.isAssignment(treeElement),
        isObjectExpression = conditions.isObjectExpression(treeElement),
        isReturnStatement = conditions.isReturnStatement(treeElement),
        isMemberExpression = conditions.isMemberExpression(treeElement),
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
            var childElement = treeElement[i];
            if (childElement.type === "IfStatement"){
                convertIfStatementToUseBlockStatement(childElement);
            }
            recurse(childElement);

            /*
                Ok, now propagate the code modifications into the array (e.g. adding a logging call after the current line).
            */

            /*
                Uh, so sometimes the modify property is set on a child rather than the element itself.
                For example if there's have an assignment it looks like this:
                [{type: "ExpressionStatement", expression: {type: "AssignmentExpression"}}]
                Notice that when we add a modification to the assignment expression it needs to be handled
                by the loop for the outer array... the one for the ExpressionStatement.

                TODO: There's a good chance this will fail in some situations.
            */
            var modifications = [childElement.modify];
            for (var property in childElement){
                var value = treeElement[i][property];
                if (value && value.modify !== undefined) {
                    modifications.push(value.modify);
                }
            }
            // Now lets make all the modifications we have.
            modifications.forEach(function(modify){
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
                    if (modify.prependToBody){
                        modify.prependToBody.forEach(function(instruction){
                            // TODO: I don't even know what this is....
                            // It seems to be an issues with return statements
                            // and the program tries to evaluate annotation calls etc?
                            // This happens when returning a function from a function call

                            if (!childElement.body){return;}
                            childElement.body.body.unshift(instruction);
                        });
                    }


                    if (!modify.remove){
                        childElement.modify = undefined;
                    }
                }
            })
        }
    }
    else if (isVariableDeclaration){
        treeElement.declarations.forEach(function(declaration){
            if (declaration.init != null){ // It's null if we just have 'var a;' instead of 'var a =5;'
                recurse(declaration.init);
            }
        })
    }
    else if (isAssignment){
        // On the right of an assignment we might have a function definition or an object that contains function definitions
        recurse(treeElement.right);
    }
    else if (isObjectExpression){
        // Objects can contain function definitions, so we need to find them
        treeElement.properties.forEach(function(property){
            recurse(property.value);
        });
    }
    else if (isCallExpression) {
        // Arguments to call expressions can functions, or objects containing functions...
        treeElement.arguments.forEach(function(argument){
            recurse(argument);
        });
    }
    else if (isReturnStatement){
        if (treeElement.argument != null){
            recurse(treeElement.argument); // might be returning a function literal
        }
    }
    else if (isMemberExpression){
        recurse(treeElement.object);
    }

    for (var i=0; i<parseNestingChildren.length; i++){
        var child = parseNestingChildren[i].toString();
        if (treeElement[child]){
            recurse(treeElement[child]);
        }
    }


}

exports.traverseParseTree = traverseParseTree;
