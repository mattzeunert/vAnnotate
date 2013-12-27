var folder = './site';
var htmlFile = '/test.html';

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
        var mkdirp = require('mkdirp');
        mkdirp('./vAnnotate-output', function(){
            fs.writeFile('./vAnnotate-output/' + req.body.fileId + '.html', generateOverlayHtml(req.body.fileId, results, code));
            
            res.end('Done.');    
        })
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

var server = app.listen(3000);
console.log('Listening on port 3000');

var phantom = require('phantom');
phantom.create(function(ph){
    ph.createPage(function(page){
        page.open('http://localhost:3000' + htmlFile, function(){
            console.log('opened')
            server.close()  
            setTimeout(function(){
                // Todo: don't just pray and hope that the results are in...
                process.exit(code=0)            
            }, 500)
        })
    })
})

