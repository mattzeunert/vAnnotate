/*
    Command line wrapper for vAnnotate server. See Readme.md for instructions.
*/

var server = require('./server'),
    ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser();
parser.addArgument(
    ['rootPath'],
    {
        nargs: '?',
        defaultValue: '.'
    }
);


// Easier way to create JSON result files:
// node lib/vAnnotate --htmlFileV2=demos/underscore-master/test/index.html --outputDirectoryV2=/tmp/oooo/
parser.addArgument(
    ['--htmlFileV2']
);
parser.addArgument(
    ['--outputDirectoryV2']
);

// Old code used for automated tests
parser.addArgument(
    ['htmlFile'],
    {
        nargs: '?'
    }
);
parser.addArgument(
    ['-p', '--port'],
    {
        defaultValue: 7000
    }
);
parser.addArgument(
    ['--save'],
    {
        action: 'storeTrue'
    }
);
parser.addArgument(
    ['--json-output']
);

args = parser.parseArgs();
console.log(args)


var options = args;

options.outputFormat = server.outputFormats.ANNOTATED_CODE;
if (args.json_output){
    options.outputFormat = server.outputFormats.JSON;
}

options.outputDirectory = args.json_output;

var serverInstance = server.start(options);

if (args.json_output || args.htmlFileV2){
    var htmlFile;
    var timeout = 500;
    if (args.json_output){
        htmlFile = args.htmlFile;
    }
    if (args.htmlFileV2) {
        htmlFile = args.htmlFileV2;
        timeout = 3000;
    }

    if (htmlFile[0] !== '/'){
        htmlFile = '/' + htmlFile;
    }

    var phantom = require('phantom');
    var baseUrl = 'http://localhost:' + options.port;
    phantom.create(function(ph){
        ph.createPage(function(page){
            page.open(baseUrl + htmlFile, function(){
                setTimeout(function(){
                    // Todo: don't just pray and hope that the results are in...
                    if (args.htmlFileV2){
                        downloadFile(baseUrl + '/vAnnotate/json/results', function(json){
                            var results = JSON.parse(json);
                            var resultsStored = 0;
                            var mkdirp = require('mkdirp')
                            mkdirp(args.outputDirectoryV2)
                            results.forEach(function(result){
                                downloadFile(baseUrl + result.resultPath, function(annotationResult){
                                    var fs = require('fs');
                                    var outputPath = args.outputDirectoryV2 + JSON.parse(annotationResult).fileHash + '.json';
                                    console.log('writing to', outputPath)
                                    fs.writeFile(outputPath, annotationResult, function(){
                                        resultsStored++;
                                        if (resultsStored === results.length){
                                            process.exit(code=0)
                                        }
                                    })

                                })
                            })
                        })
                        console.log('v2')
                    }
                    if (args.json_output){
                        process.exit(code=0)
                    }


                }, timeout)
            })
        })
    })
}

if (args.htmlFileV2){

}

function downloadFile(url, cb){
    var http = require('http');
    http.get(url, function(response){
        var text = "";
        response.on('data', function(chunk){
            text += chunk.toString();
        })
        response.on('end', function(){
            cb(text);
        })
    })
}
