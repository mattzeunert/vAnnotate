/*
    Converts logged values to string representations.

    This file has unit tests in Node and is also included in the browser JS.
*/


function _countObjectProperties(obj){
    var count = 0;
    for (var key in obj){
        count ++;
        if (count > 100){
            return 'over 100 '
        }
    }
    return count;
}

// This could be a generic helper function, but because we need it in both the browser and Node it isn't...
function truncate(str, length, ellipsis){
  if (str.length < length){
    return str;
  }
  return str.substring(0, length) + ellipsis;
}


var serializeLogResult = function(logResult, preventDiggingDeeper){
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
        return '"' + logResult + '"';
    }

    var isArray = Array.isArray(logResult);
    if (isArray){
        if (preventDiggingDeeper) { return '(Array)'}
        if (logResult.length < 4){
            var ret = '['
            ret += logResult.map(function(value){
                return serializeLogResult(value, true);
            }).join(', ');
            ret += ']';
            return ret;
        }
        return 'Array with ' + logResult.length + ' members: [\n ' + logResult[0].toString() + ',\n' + logResult[1].toString() + ', \n' + logResult[2].toString() + ', ...]';
    }


    if (!isArray && type === 'object'){
        if (preventDiggingDeeper) { return '(Object)'}
        var serialized = 'Object with ' + _countObjectProperties(logResult) + ' properties' +
            '\n Converted to string: \"' + truncate(logResult.toString(), 100, '...') + ' \"';
        serialized += '{\n';
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

            serialized += '    ' + property + ':' + valueString + '\n';
            serializedPropertyCount++;
        }
        serialized += '}';
        return serialized;
    }

    if (type === 'function'){
        var serialized = 'Function with ' + logResult.length + ' arguments\n',
            functionBody = logResult.toString().split('\n');
        // Return up to 5 lines of the function body...
        serialized  += functionBody.slice(0,5).join('\n');
        return serialized
    }

    return 'Serialization of this variable failed.';
}

// This file is used both in the browser and in Node, so if it's in node export the necessary functions
if (typeof exports !== 'undefined' && typeof require !== 'undefined'){
    exports.serializeLogResult = serializeLogResult;
    exports._countObjectProperties = _countObjectProperties;
}
