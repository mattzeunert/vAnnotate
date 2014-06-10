/*
    Converts logged values to string representations.

    This file has unit tests in Node and is also included in the browser JS.
*/


function _countObjectProperties(obj){
    var count = 0;
    var functionCount = 0;
    for (var key in obj){
        if (typeof obj[key] === 'function'){
            functionCount++;
        }
        count ++;
        if (count >= 100){
            break;
        }
    }
    var isMinimum = count >= 100;
    return {
        total: count,
        functions: functionCount,
        values: count - functionCount,
        isMinimum: isMinimum
    }
}

// This could be a generic helper function, but because we need it in both the browser and Node it isn't...
function truncate(str, length, ellipsis){
  if (str.length < length){
    return str;
  }
  return str.substring(0, length) + ellipsis;
}

function escapeUnicodeCharacters(str){
    return str.replace(/[\s\S]/g, function (escape) {
        return '\\u' + ('0000' + escape.charCodeAt().toString(16)).slice(-4);
    });
}


var serializeLogResult = function(logResult, preventDiggingDeeper, reallyPreventGoingDeeper){
    var type = typeof logResult;

    if (logResult === null){
        return 'null';
    }
    if (logResult === undefined){
        return 'undefined'
    }

    if (type === 'number' || type === 'boolean'){
        return logResult.toString();
    }

    if (type === 'string'){
        // Don't do anything for now, but we might need to maybe truncate the string in the future
        return '"' + escapeUnicodeCharacters(logResult) + '"';

    }

    var isArray = Array.isArray(logResult);
    if (isArray){
        if (reallyPreventGoingDeeper) { return '(Array[' + logResult.length + '])'}
        var res = {
            vaType: 'list'
        }
        if (logResult.length < 5){
            res.items = [];

            for (var i=0;i<logResult.length && i < 4;i++){
                var value = logResult[i];
                res.items.push(serializeLogResult(value, true, preventDiggingDeeper ? true : false))
            }

            res.length = logResult.length;
            return res;
        }
        return 'Array[' + logResult.length + ']\n[' + logResult[0].toString() + ',\n' + logResult[1].toString() + ', \n' + logResult[2].toString() + ', ...]';
    }


    if (!isArray && type === 'object'){
        if (reallyPreventGoingDeeper) { return '(Object)'}
        var objectPropertyCount = _countObjectProperties(logResult);
        var serialized = '';
        if (!preventDiggingDeeper){
            serialized += 'Object';
            if (objectPropertyCount.total > 0){
                serialized += ' (' +
                    objectPropertyCount.values + (objectPropertyCount.isMinimum ? '+' : '') + ' values, ' +
                    objectPropertyCount.functions + (objectPropertyCount.isMinimum ? '+' : '') + ' functions)'
            }
            serialized += ' \"' + truncate(logResult.toString(), 30, '...') + '\"';
            serialized += '\n';
        }

        serialized += '{';
        var serializedPropertyCount = 0;
        for (property in logResult){
            if (serializedPropertyCount===5){
                serialized += '(...)\n';
                break;
            }
            var value = logResult[property];
            valueString = '';
            // We're duplicating quite a lot of the normal logging code...
            // The reason is that we want to handle serialization slightly differently, i.e. not
            // serialize objects or that could create massive nested objects....
            if (typeof value === 'function'){
                valueString = 'function';
            }
            else if (value === null){
                valueString = 'null';
            }
            else if (value === undefined){
                valueString = 'undefined';
            }
            else {
                valueString = value.toString();
            }

            serialized += '   ' + (serializedPropertyCount !== 0 ? ' ' : '') + escapeUnicodeCharacters(property) + ': ' + valueString + '\n';
            serializedPropertyCount++;
        }
        serialized += '}';
        return serialized;
    }

    if (type === 'function'){
        var serialized = 'Function\n',
            functionBody = logResult.toString();
        // Remove some of the injected code
        functionBody = functionBody.replace(/window.vAnnotate.log.*?\);\n/g,'');
        // Remove all indentation... it only makes it worse
        functionBody = functionBody.replace(/[^\S\n]+/g,' ');

        var functionBodyLines = functionBody.split('\n');
        // Return up to 5 lines of the function body...
        serialized  += functionBodyLines.slice(0,6).join('\n');
        if (functionBodyLines > 5){
            serialized += '(...)'
        }
        return serialized
    }

    return 'Serialization of this variable failed.';
}

// This file is used both in the browser and in Node, so if it's in node export the necessary functions
if (typeof exports !== 'undefined' && typeof require !== 'undefined'){
    exports.serializeLogResult = serializeLogResult;
    exports._countObjectProperties = _countObjectProperties;
}
