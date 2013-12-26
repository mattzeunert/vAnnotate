var esprima = require('esprima'),
    escodegen = require('escodegen')

// DEV
setTimeout(function(){
    var code = 'window.a = 4;fn()';
    var parsed = esprima.parse(code);
    traverseParseTree(parsed, [{
        condition: function(treeElement){
            return treeElement.type == 'ExpressionStatement'
                && treeElement.expression.type == 'AssignmentExpression';
        },
        handle: function(treeElement){
            treeElement.modify = {
                after: [ esprima.parse('console.log("yay")').body[0] ]
            }
        }
    }]);
    console.log(escodegen.generate(parsed))
    debugger;
})
//

exports.conditions = {
    isAssignment: function(treeElement){
        return treeElement.type == 'ExpressionStatement'
                && treeElement.expression.type == 'AssignmentExpression';
    }
}

///


var injectLogging = function(){

}



var parseNestingChildren = [
    'body',
    'expression',
    'callee',
    'consequent'
];
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
                if (modify.after){
                    modify.after.forEach(function(after){
                        treeElement.splice(i + 1, 0, after)
                    });
                    i += modify.after.length;
                }
            }
        }
    }
    else {
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
            // TODO: make sure all nested elements are handled
        }

    }
}

exports.traverseParseTree = traverseParseTree;