var esprima = require('esprima'),
    escodegen = require('escodegen'),
    helper = require('./helper'),
    logInjector = require('./log-injector');



var express = require('express');
var app = express();
app.use(express.bodyParser());

app.post('/vAnnotate/results', function(req, res){
    var results = JSON.parse(req.body.results);
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
                fileContents = logInjector.injectLogging(fileContents);
            }
            res.end(fileContents)
        }
    });
});

app.listen(3000);
console.log('Listening on port 3000');
