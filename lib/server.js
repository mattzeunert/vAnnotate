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
    fs = require('fs');

var severFs;
var outputDir;
var outputFormat;

var express = require('express');
var app = express();
var mkdirp = require('mkdirp')
app.use(express.bodyParser());

var fileHashes = {};

var generateOverlayHtml = function(results, code){
    var loggingSetup = logInjector.getLoggingSetup(code);
    var overlay = codeOverlay.generate(loggingSetup, results, code);

    var path = require('path');
    overlayHtml = fs.readFileSync(path.resolve(__dirname, './overlay-page.html')).toString();
    overlayHtml = overlayHtml.replace('{{code}}', overlay);
    return overlayHtml;
}

var jsonResults = {};

app.post('/vAnnotate/results', function(req, res){
    var results = JSON.parse(req.body.results),
        filePath = fileHashes[req.body.fileId];

    serverFs.readFile(filePath, function(err, code){
        if (outputFormat === outputFormats.ANNOTATED_CODE){
            mkdirp(outputDir, function(err) { 
                fs.writeFile(outputDir + filePath + '.html', generateOverlayHtml(results, code));
                res.end('Done.');
            });
        }
        else if (outputFormat === outputFormats.JSON){
            console.log('=========================================')
            jsonResults[req.body.fileId] = results;
            fs.writeFile(outputDir, JSON.stringify(jsonResults), function(){
                res.end('Done.');
            });

        }
    })
});

 

app.get('*', function(req, res){
    serverFs.readFile(req.path, function(err, data){
        if (err){
            res.end(err.message);
        }
        else {
            var fileContents = data.toString();
            if (helper.endsWith(req.path, '.js')){
                fileHashes[helper.sha1(fileContents)] = req.path;
                fileContents = logInjector.injectLogging(fileContents);
                console.log(fileContents)
            }
            res.end(fileContents)
        }
    });
});

exports.start = function(options){
    serverFs = serverFsMaker.create(options.rootPath)
    outputDir = options.outputDirectory;
    outputFormat = options.outputFormat
	return app.listen(3000);
}

var outputFormats = {
    ANNOTATED_CODE: 0,
    JSON: 1
}
exports.outputFormats = outputFormats;








