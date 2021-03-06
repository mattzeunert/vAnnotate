/*

Uses codeTraverser to detect variable assignments etc and inject
logging code.

*/

var esprima = require('esprima'),
    escodegen = require('escodegen'),
    codeTraverser = require('./code-traverser'),
    fs = require('fs'),
    path = require('path'),
    helper = require('./helper'),
    Handlebars = require('Handlebars');


var createLoggingCall = function(fileId, id, value){
    var loggingCall = 'window.vAnnotate.log("' + fileId + '", ' + id + ', ' + value + ')';
    return esprima.parse(loggingCall);
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

var generateBrowserCode = function(fileId){
    var getFilePath = function(fileName){
            return path.resolve(__dirname, fileName)
        },
        browserCodePath = getFilePath('vAnnotate-browser.js'),
        serializeLogResultPath = getFilePath('serialize-log-result.js'),
        browserCode = fs.readFileSync(browserCodePath).toString(),
        templateData = {
            fileId: fileId,
            serializeLogResult: fs.readFileSync(serializeLogResultPath)
        }

    var code = Handlebars.compile(browserCode)(templateData);
    return code;
}

/*
    Injection function that returns both the updated code and
      a list of places where code was injected.
*/
var _injectLogging = function(code){
    var parsed,
        id = 0,
        logging = [];

    try {
        parsed = esprima.parse(code, {range: true, loc: true})
    }
    catch (err){
        parsed = esprima.parse('alert("ran into an esprima parse error...");')
    }

    var fileId = helper.vAnnotateFileHash(code),
        _createLoggingCall = function(id, value){
            return createLoggingCall(fileId, id, value);
        }


    codeTraverser.traverseParseTree(parsed, [
        {
            condition: codeTraverser.conditions.isAssignment,
            handle: function(treeElement){
              var whatToLog = '"vAnnotate - Not sure what to log."',
                  assignedValue = treeElement.right,
                  assignedValueType = assignedValue.type,
                  assignee = treeElement.left,
                  assigneeType = assignee.type;
              if (assigneeType === 'Identifier'){
                  whatToLog = treeElement.left.name;
              }
              else if (assigneeType === 'MemberExpression'){
                  whatToLog = escodegen.generate(assignee);
              }
                treeElement.modify = {
                    after: [ _createLoggingCall(id, whatToLog)]
                };
                logging.push({
                    id: id,
                    range: treeElement.left.range
                });
                id++;
            }
        },
        {
            condition: codeTraverser.conditions.isFunction,
            handle: function(treeElement){
                var logInstructions = [];
                treeElement.params.forEach(function(param){
                    logInstructions.push(_createLoggingCall(id, param.name));
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
                    logInstructions.push(_createLoggingCall(id, declaration.id.name));
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
                    after: [ returnValue, _createLoggingCall(id, returnVariableName), returnStatement],
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

    var browserCode = generateBrowserCode(fileId);

    parsed.body.unshift(esprima.parse(browserCode));
    var newCode = escodegen.generate(parsed);

    logging = logging.sort(function(a,b){
        return a.range[0] - b.range[0];
    });

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
