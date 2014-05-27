/*

Set up a server that serves local files and injects logging code
into any Javascript files that are downloaded.

*/

var esprima = require('esprima'),
    escodegen = require('escodegen'),
    helper = require('./helper'),
    logInjector = require('./log-injector'),
    codeOverlay = require('./code-overlay'),
    serverFsMaker = require('./server-filesystem'),
    fs = require('fs'),
    escapeHtml = require('escape-html'),
    log = require('./log');

var severFs;
var outputDir;
var outputFormat;
var saveResults;

var express = require('express');
var app = express();
var mkdirp = require('mkdirp')
app.use(express.bodyParser());

var fileHashes = {};

var getFileResults = function(results, code){
    return {
        setup: logInjector.getLoggingSetup(code),
        results: results,
        fileHash: helper.vAnnotateFileHash(code)
    }
}

var generateOverlayHtml = function(results, code, filename){
    var loggingSetup = logInjector.getLoggingSetup(code);
    var overlay = codeOverlay.generate(loggingSetup, results, code);

    var path = require('path');
    overlayHtml = fs.readFileSync(path.resolve(__dirname, './overlay-page.html')).toString();
    overlayHtml = overlayHtml.replace('{{code}}', overlay);

    var overlayCss = fs.readFileSync(path.resolve(__dirname, './overlay-page-css.css')).toString();
    var overlayJs = fs.readFileSync(path.resolve(__dirname, './overlay-page-js.js')).toString();
    overlayHtml = overlayHtml.replace('{{overlayPageCss}}', overlayCss);
    overlayHtml = overlayHtml.replace('{{overlayPageJs}}', overlayJs);

    overlayHtml = overlayHtml.replace('{{filename}}', filename);
    return overlayHtml;
}

var jsonResults = {};


// Endpoint to send logging data to
app.post('/vAnnotate/results', function(req, res){
    var results = JSON.parse(req.body.results),
        filePath = fileHashes[req.body.fileId],
        fileId = req.body.fileId;

    jsonResults[fileId] = results;

    if (saveResults){
        if (filePath === undefined){
            console.log('Getting results from unknown file, this is probably because the server was restarted while a page that was loaded from it was still open.');
        }
        else {
            serverFs.readFile('.' + filePath, function(err, data){
                if (err){console.log(err);return}
                var code = data.toString();

                var fileResults = getFileResults(results, code);
                fs.writeFile('result-server/results/' + fileId + '.json', JSON.stringify(fileResults))
            })
        }
    }


    if (outputDir){
        serverFs.readFile(filePath, function(err, code){
            if (outputFormat === outputFormats.ANNOTATED_CODE){
                mkdirp(outputDir, function(err) {
                    fs.writeFile(outputDir + filePath + '.html', generateOverlayHtml(results, code, require('path').basename(filePath)));
                    res.end('Done.');
                });
            }
            else if (outputFormat === outputFormats.JSON){
                fs.writeFile(outputDir, JSON.stringify(jsonResults), function(){
                    res.end('Done.');
                });
            }
        })
    }
    else {
        res.end("Done.")
    }

});

// Overview page listing files with annotations.
app.get(/\/vAnnotate\/(json\/)?results$/, function(req, res){
    var showJsonResults = req.path.substr(0, '/vAnnotate/json/'.length) === '/vAnnotate/json/';

    var html = "<html>View annotations for these files:<br>";
    var json = []
    for (fileHash in fileHashes){
        var filePath = fileHashes[fileHash];
        html += '<a href="/vAnnotate/results' + filePath + '">' + filePath + '</a><br>';
        json.push({
            filePath: filePath,
            resultPath: '/vAnnotate/json/results' + filePath
        });
    }
    html += "<br><br>(If there are no annotations you first need to load the page that uses the JS files, or something went wrong.)</html>"
    if (showJsonResults){
        res.end(JSON.stringify(json));
    }
    res.end(html)
});

// Serve annotated code
app.get(/\/vAnnotate\/(json\/)?results\/.*/, function(req, res){
    var path = decodeURIComponent(req.path);

    var showJsonResults = req.path.substr(0, '/vAnnotate/json'.length) === '/vAnnotate/json';
    var filePath = '/' + path.replace('/vAnnotate/results/', '').replace('/vAnnotate/json/results/', '');

    serverFs.exists(filePath)
        .then(function(exists){
            if (exists){
                serverFs.readFile(filePath, function(err, code){
                    var results = jsonResults[helper.vAnnotateFileHash(code)];
                    if (results !== undefined){
                        var filename = require('path').basename(filePath);
                        if (showJsonResults){
                            res.end(JSON.stringify(getFileResults(results, code)))
                        } else {
                            res.end(generateOverlayHtml(results, code, filename));
                        }
                    }
                    else {
                        if (showJsonResults){
                            res.send(JSON.stringify({
                                success: false,
                                message: 'No annotation data found'
                            }))
                        }
                        else {
                           res.end([
                                '<!doctype html>',
                                'No annotation data was found for this file. <br>',
                                'An Html file needs to load the code first. ',
                                'Check if there are exceptions that might prevent the logged data to be returned.'
                            ].join(''))
                        }
                    }
                });
            }
            else {
                if (showJsonResults){
                    res.end(JSON.stringify({
                        success: false,
                        message: 'File not found'
                    }));
                } else {
                    res.end('The source file doesn\'t exist: ' + escapeHtml(filePath));
                }
            }
        });
});


// Serve a directory listing, static file or static JS file with injected logging
app.get('*', function(req, res){
    var path = decodeURIComponent(req.path);

    function serveFile(){
        serverFs.readFile(path, function(err, data){
            if (err){
                res.end(err.message);
            }
            else {
                var fileContents = data.toString();
                if (helper.endsWith(path, '.js')){
                    fileHashes[helper.vAnnotateFileHash(fileContents)] = req.path;
                    fileContents = logInjector.injectLogging(fileContents);
                }
                res.end(fileContents);
            }
        });
    }

    serverFs.exists(path)
        .then(function(pathExists){
            if (pathExists) {
                serverFs.stat(path)
                    .then(function(stats){
                        var isDirectory = stats.isDirectory();
                        if (isDirectory){
                            html = '<!doctype html><div style="line-height: 22px;font-family:sans-serif"><style>a {text-decoration: none;color: #777} b.html a {color:black} a:hover{text-decoration:underline}</style>';
                            var files = serverFs.readDirSync(path);
                            html += files.length + ' in ' + escapeHtml(path) + '<br><br>';
                            files.forEach(function(file){
                                var isHtmlFile = helper.endsWith(file, ".html");
                                if (isHtmlFile){
                                    html += '<b class="html">';
                                }
                                var link = path;
                                if (!helper.endsWith(link, '/')){
                                    link += '/';
                                }
                                link += file;
                                html += '<a href="' + encodeURI(link) + '">' + escapeHtml(file) + '<br>';
                                if (isHtmlFile){
                                    html += "</b>";
                                }
                            });

                            html += '<br><br>';
                            html += '<a style="color: black;" href="/vAnnotate/results">View annotated Javascript files</a>';
                            html += '</div>';

                            res.end(html)
                        }
                        else {
                            serveFile();
                        }
                    });
            }
            else {
                res.status(404);
                res.end('This file doesn\'t exist')
            }
        });

});

exports.start = function(options){
    serverFs = serverFsMaker.create(options.rootPath)
    outputDir = options.outputDirectory;
    outputFormat = options.outputFormat || outputFormats.ANNOTATED_CODE
    saveResults = options.save

    var server = app.listen(options.port);
    log('Listening on http://localhost:' + options.port, 'always');
    return server;
}

var outputFormats = {
    ANNOTATED_CODE: 0,
    JSON: 1
}
exports.outputFormats = outputFormats;








