/*
    Command line wrapper for vAnnotate server. See Readme.md for instructions.
*/

var server = require('./server'),
    ArgumentParser = require('argparse').ArgumentParser,
    $ = require('jquery-deferred'),
    helper = require('./helper');

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

console.log(args)
if (args.json_output || args.htmlFileV2){
    console.log('V2', args.htmlFileV2)
    var htmlFile;
    var timeout = 500;
    if (args.json_output){
        htmlFile = args.htmlFile;
    }
    if (args.htmlFileV2) {
        htmlFile = args.htmlFileV2;
        timeout = 3000;
    }

    var allHtmlFiles = htmlFile === 'ALL'
    if (allHtmlFiles){
        getAllHtmlFiles(args.rootPath)
        .then(doMore);
    }
    else {
        doMore();
    }

    // might want a better name, maybe
    function doMore(){
        if (htmlFile[0] !== '/'){
            htmlFile = '/' + htmlFile;
        }



        var phantom = require('phantom');
        var baseUrl = 'http://localhost:' + options.port;
        phantom.create(function(ph){
            var outputDirectory = args.outputDirectoryV2;
            processPage(ph, baseUrl, htmlFile, outputDirectory, 'prefix-')
            .then(function(){
                console.log('done');
                process.exit(code=0);
            });
        })
    }
}

function processPage(ph, baseUrl, htmlFile, outputDirectory, outputFilePrefix){
    var def = $.Deferred();

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
                                var outputPath = outputDirectory + outputFilePrefix + JSON.parse(annotationResult).fileHash + '.json';
                                console.log('writing to', outputPath)
                                fs.writeFile(outputPath, annotationResult, function(){
                                    resultsStored++;
                                    console.log(resultsStored, results.length)
                                    if (resultsStored === results.length){
                                        def.resolve();
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

    return def.promise();
}

function getAllHtmlFiles(directory){
    var walker = walk.walk(directory);
    var def = $.Deferred();
    var htmlFiles = [];

    walker.on('file', function(root, stat, next){
        var path = root + stat.name;
        if (helper.endsWith(path, '.html')){
            console.log('found', path)
            htmlFiles.push(path);
        }
        next();
    })

    walker.on('end', function(){
        process.exit(0)
        def.resolve(htmlFiles)
    })

    return def.promise();
}

function downloadFile(url, cb){
    var request = require('request');
    request(url, function (error, response, body) {
      cb(body);
    })
}
