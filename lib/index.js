var esprima = require('esprima'),
    escodegen = require('escodegen'),
    helper = require('./helper'),
    logInjector = require('./log-injector'),
    codeOverlay = require('./code-overlay'),
    serverFs = require('./server-filesystem'),
    fs = require('fs');



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

app.listen(3000);
console.log('Listening on port 3000');










