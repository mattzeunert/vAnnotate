/*

Generates the Html output containing the annotations.

*/

var fs = require('fs'),
    _ = require('underscore'),
    helper = require('./helper'),
    logInjector = require('./log-injector.js'),
    serverFs = require('./server-filesystem'),
    escapeHtml = require('escape-html');

exports.generate = function(loggingSetup, results, code){
    loggingSetup = _.sortBy(loggingSetup, function(loggingItem){
        return loggingItem.range[0];
    });

    var output = '';
    var codeIndex = 0;
    loggingSetup.forEach(function(loggingItem, i){

        output += escapeHtml(code.substring(codeIndex, loggingItem.range[0]));
        output += '<div class="annotated-element js-annotation-index-' + i + '" style="display: inline-block;" data-annotation-index="' + i + '"'  +'>';
        output +=  code.substring(loggingItem.range[0], loggingItem.range[1])
        output += '</div>';
        codeIndex = loggingItem.range[1];
    });
    output += code.substring(codeIndex, code.length)

    output += '<script>var results = ' + JSON.stringify(results) + '</script>';

    return output;

}
