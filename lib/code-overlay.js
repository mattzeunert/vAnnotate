/*

Generates the Html output containing the annotations.

*/

var fs = require('fs'),
    _ = require('underscore'),
    pygments = require('pygments'),
    Q = require('q'),
    helper = require('./helper'),
    logInjector = require('./log-injector.js'),
    serverFs = require('./server-filesystem'),
    escapeHtml = require('escape-html');

exports.generate = function(loggingSetup, results, code){

    var def = Q.defer();

    var options = {

    };
    pygments.colorize(code, 'javascript', 'html', function(formattedCode){
        var resultData = {
            results: results,
            setup: loggingSetup
        };

        var output = formattedCode.replace(/__LINE_BREAK__/g, '<br>');
        var jsonString = escapeJsonForHtml(JSON.stringify(resultData))
        output += '<script>var vAnnotateResults = JSON.parse(\'' + jsonString + '\')</script>';

        def.resolve(output);
    }, options);

    return def.promise;

    loggingSetup = _.sortBy(loggingSetup, function(loggingItem){
        return loggingItem.range[0];
    });

    var output = '';
    var codeIndex = 0;
    loggingSetup.forEach(function(loggingItem, i){
        output += escapeHtml(code.substring(codeIndex, loggingItem.range[0]));
        output += '<div class="annotated-element js-annotation-index-' + i + '" style="display: inline-block;" data-annotation-index="' + i + '"'  +'>';
        output +=  escapeHtml(code.substring(loggingItem.range[0], loggingItem.range[1]))
        output += '</div>';
        codeIndex = loggingItem.range[1];
    });
    output += escapeHtml(code.substring(codeIndex, code.length))


    return output;

    function escapeJsonForHtml(str){
        return str
        .replace(/\\/g, '\\\\')
        .replace(/\\\"/g, '\\\\\"')
        .replace(/\'/g, '\\\'')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;');
    }


}
