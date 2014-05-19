/*

Generic helper functions.

*/

var crypto = require('crypto');
var path = require('path');

exports.endsWith = function(str, ending){
    return  str.slice(str.length - ending.length) == ending;
}

exports.startsWith = function(str, starting){
    return str.slice(0, starting.length) === starting
}

exports.htmlEscapeQuotes = function(str){
  if (str===undefined){debugger;}
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#39;');
    return str;
}

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
exports.guid = function(){
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    };

    return s4() + s4() + s4() + s4() +
             s4()  + s4() + s4() + s4();
}

exports.stripNonAsciiCharacters = function(str){
    return str.replace(/[^\nA-Za-z 0-9 \.,\?""\'!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
}

exports.sha1 = function(str){
    var hash = crypto.createHash('sha1');
    hash.update(str);
    return hash.digest('hex');
}

function stripFinalLineBreaks(str){
    var lines = str.split('\n');
    // Github strips out final new lines in gists, so always strip them
    var reversedLines = lines.reverse();
    for (var i=0; i< reversedLines.length;i++){
        if (reversedLines[i] == ''){
            reversedLines.shift();
            i--;
        }
        else {
            break;
        }
    }
    lines = reversedLines.reverse();
    return lines.join('\n')
}

exports.vAnnotateFileHash = function(str){
    // I coulnd't figure out how to get a matching hash between the Github version
    // and the vAnnotate server version if the code contains non-ascii characters...
    // so just get rid of them
    var lines = str.split('\n');
    for (var i=0; i<lines.length; i++){
        // Pygment's output (I think) doesn't differentiate
        // between an empty line and a line with just a space.
        if (lines[i] === ' '){
            lines[i] == '';
        }
    }

    str = lines.join('\n')

    str = stripFinalLineBreaks(str);

    // Somehow it doesn't cope with line breaks well,
    // maybe it's different kinds of line breaks?
    str = str.replace(/\n/g,'\n');

    console.log('hashing', '----' + str + '----')
    str = exports.stripNonAsciiCharacters(str);
    console.log('hashing', '----' + str + '----')
    var ret = exports.sha1(str);
    console.log('result is ', ret)
    return ret;
}

exports.pathIsSubdirectory = function(subpath, parentPath){
    subpath = path.resolve(subpath);
    console.log(subpath)
    parentPath = path.resolve(parentPath);
    console.log(parentPath)
    return exports.startsWith(subpath ,parentPath)
}
