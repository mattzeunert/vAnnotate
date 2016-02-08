/*
    Command line wrapper for vAnnotate server. See Readme.md for instructions.
*/

var server = require('./server'),
    ArgumentParser = require('argparse').ArgumentParser,
    $ = require('jquery-deferred'),
    helper = require('./helper'),
    log = require('./log'),
    pathApi = require('path');

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
*/
parser.addArgument(
    ['--mergeResultDirectory']
)
parser.addArgument(
    ['--mergeResultOutputDirectory']
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
    var fileCount = 0;

    var walker = walk.walk(args.mergeResultDirectory);
    walker.on('file', function(root, stat, next){
        var filePath = require('path').join(root, stat.name);
        if (stat.name === '.DS_Store'){
            next();
            return;
        }
        console.log('file #' + fileCount , filePath)
        fileCount++;
        fs.readFile(filePath, function(err, data){
            var json = JSON.parse(data);
            if (json.fileHash in results){
                for (var key in json.results){
                    var res = json.results[key];
                    if (results[json.fileHash].results[key] === undefined){
                        results[json.fileHash].results[key] = json.results[key];
                    }
                }
            }
            else {
                results[json.fileHash] = json;
            }
            next();
        })
    })

    walker.on('end', function(){
        log('Total results size: ' + Math.round(JSON.stringify(results).length/1024/1024 * 10)/10 + 'MB', 'normal')
        log('(keep this in mind since there might well be memory issues at some point)', 'normal')

        var outputDir = args.mergeResultOutputDirectory;
        var rmdir = require('rimraf');
        rmdir(outputDir, function(){

            var mkdirp = require('mkdirp');
            mkdirp(outputDir)
            var resultsToWrite = 0;
            for (var key in results){
                resultsToWrite++;
                var res = results[key];
                var filePath = outputDir + res.fileHash + '.json';
                console.log('writing results for ', res._filePath)
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
else {


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

        var allHtmlFiles = htmlFile === 'ALL'
        if (allHtmlFiles){
            getAllHtmlFiles(args.rootPath)
            .then(function(files){
                console.log('found ' + files.length + ' html')
                doMore(files)
            });
        }
        else {
            doMore([htmlFile]);
        }

        // might want a better name, maybe...
        function doMore(htmlFiles){
            for (var i=0; i<htmlFiles.length; i++){
                if (htmlFiles[i][0] !== '/'){
                    htmlFiles[i] = '/' + htmlFiles[i];
                }
            }

            var phantom = require('phantom');
            var baseUrl = 'http://localhost:' + options.port;
            phantom.create(function(ph){
                var outputDirectory = args.outputDirectoryV2;
                var i = 0;
                continueProcessing();
                function continueProcessing(){
                    console.log('precessing file #'+ i)
                    processFile(htmlFiles[i]).then(function(){
                        i++;
                        if (i< htmlFiles.length){
                            continueProcessing();
                        }
                        else {
                            process.exit(0);
                        }
                    })
                }


                function processFile(htmlFile){
                    var def = $.Deferred();
                    processPage(ph, baseUrl, htmlFile, outputDirectory, Math.random() + htmlFile.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g,''))
                    .then(function(){
                        def.resolve();
                    });
                    return def.promise();
                }
            })
        }
    }

    function processPage(ph, baseUrl, htmlFile, outputDirectory, outputFilePrefix){
        var def = $.Deferred();

        ph.createPage(function(page){
            var url = baseUrl + htmlFile;
            log('Fetching url: ' + url, 'normal');
            page.open(url, function(){
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
                                    var outputPath = outputDirectory + outputFilePrefix + '__hash__' + JSON.parse(annotationResult).fileHash + '.json';
                                    fs.writeFile(outputPath, annotationResult, function(){
                                        resultsStored++;
                                        if (resultsStored === results.length){
                                            def.resolve();
                                        }
                                    })

                                })
                            })
                            if (results.length === 0){
                                def.resolve();
                            }
                        })
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
            var path = pathApi.join(root, stat.name);
            if (helper.startsWith(path, directory)){
                path = path.substr(directory.length)
            }
            if (helper.endsWith(path, '.html')){
                htmlFiles.push(path);
            }
            next();
        })

        walker.on('end', function(){
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
}
