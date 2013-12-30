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
var express = require('express');
var app = express();
app.use(express.bodyParser());

var generateOverlayHtml = function(fileId, results, code){
    var loggingSetup = logInjector.getLoggingSetup(fileId, code);
    var overlay = codeOverlay.generate(loggingSetup, results, code);

    var path = require('path');
    overlayHtml = fs.readFileSync(path.resolve(__dirname, './overlay-page.html')).toString();
    overlayHtml = overlayHtml.replace('{{code}}', overlay);
    return overlayHtml;
}

app.post('/vAnnotate/results', function(req, res){
    var results = JSON.parse(req.body.results);

    serverFs.readFile(req.body.fileId, function(err, code){
        
        fs.writeFile('./site/output.html', generateOverlayHtml(req.body.fileId, results, code));
        
        res.end('Done.');
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
                fileContents = logInjector.injectLogging(req.path, fileContents);
            }
            res.end(fileContents)
        }
    });
});

exports.start = function(options){
    serverFs = serverFsMaker.create(options.rootPath)
	return app.listen(3000);	
}










