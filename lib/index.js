var esprima = require('esprima'),
    escodegen = require('escodegen'),
    helper = require('./helper'),
    logInjector = require('./log-injector'),
    codeOverlay = require('./code-overlay'),
    fs = require('fs');



var express = require('express');
var app = express();
app.use(express.bodyParser());

var logging = {};

app.post('/vAnnotate/results', function(req, res){
    var results = JSON.parse(req.body.results);

    // Currently we don't send the file name with the code injections,
    // so just hope there's only one file
    var loggingSetup = null;
    var file = '';
    for (var key in logging){
        loggingSetup = logging[key];
        file = key;
    }

    var overlay = codeOverlay.generate(file, loggingSetup, results);

    var path = require('path');
    overlay = fs.readFileSync(path.resolve(__dirname, './overlay-page.html')).toString().replace('{{code}}', overlay);

   
    fs.writeFile('./site/output.html', overlay);
    
    res.end('Done.');
});

app.get('*', function(req, res){
    var fs = require('fs');
    fs.readFile('./site' + req.path, function(err, data){
        if (err){
            res.end(err.message);
        }
        else {
            var fileContents = data.toString();
            if (helper.endsWith(req.path, '.js')){
                var withLogging = logInjector.injectLogging(fileContents);
                fileContents = withLogging.code;
                logging[req.path] = withLogging.logging;
            }
            res.end(fileContents)
        }
    });
});

app.listen(3000);
console.log('Listening on port 3000');
