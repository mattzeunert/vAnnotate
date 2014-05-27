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
/*
node lib/vAnnotate --htmlFileV2=demos/underscore-master/test/index.html --outputDirectoryV2=/tmp/p/o1/;
node lib/vAnnotate --htmlFileV2=demos/underscore-master/index.html --outputDirectoryV2=/tmp/p/o2/;
node lib/vAnnotate --mergeResultDirectory=/tmp/p/
*/
parser.addArgument(
    ['--mergeResultDirectory']
)

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


var walk = require('walk')
var fs = require('fs');
if (args.mergeResultDirectory){
    var results = {};

    var walker = walk.walk(args.mergeResultDirectory);
    walker.on('file', function(root, stat, next){
        var filePath = root + '/' + stat.name;
        fs.readFile(filePath, function(err, data){
            var json = JSON.parse(data);
            if (json.fileHash in results){
                for (var key in json.results){
                    var res = json.results[key];
                    if (results[json.fileHash].results[key] === undefined){
                        //console.log('filling in #' + key, 'with', json.results[key])
                        results[json.fileHash].results[key] = json.results[key];
                    }
                }
                //console.log('already has results for', json.fileHash)
            }
            else {
                results[json.fileHash] = json;
            }
            next();
        })
    })

    walker.on('end', function(){
        console.log('Total results size: ' + Math.round(JSON.stringify(results).length/1024/1024 * 10)/10 + 'MB')
        console.log('(keep this in mind since there might well be memory issues at some point)')

        var outputDir = args.mergeResultDirectory + 'mergeResult/';
        var rmdir = require('rimraf');
        rmdir(outputDir, function(){

            var mkdirp = require('mkdirp');
            mkdirp(outputDir)
            var resultsToWrite = 0;
            for (var key in results){
                resultsToWrite++;
                var res = results[key];
                var filePath = outputDir + res.fileHash + '.json';
                // console.log('writing', filePath)
                fs.writeFile(filePath, JSON.stringify(res), function(){
                    resultsToWrite--;
                    if (resultsToWrite === 0){
                        process.exit(code=0)
                    }
                })
            }
        })

    })
}


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
