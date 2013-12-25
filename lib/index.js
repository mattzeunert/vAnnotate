var esprima = require("esprima")

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

    if (handlers[treeElement.type]){
        handlers[treeElement.type](treeElement);
    }

    if (isArray) {
        for (var i=0; i<treeElement.length; i++){
            recurse(treeElement[i]);
        }
    }
    else {
        for (var i=0; i<parseNestingChildren.length; i++){
            var child = parseNestingChildren[i].toString();
            if (treeElement[child]){
                recurse(treeElement[child]);
                break;
            }
        }
    }

    
}

exports.traverseParseTree = traverseParseTree;