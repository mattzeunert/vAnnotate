/*
    Serves annotation results so viewed code can be annoted with the previously collected data.
*/

var express = require('express');
var fs = require('fs');
var app = express();
app.use(express.bodyParser());

// Endpoint to send logging data to
app.get(/\/results\/.*/, function(req, res){
    var path = req.path;
    var fileHash = req.path.replace('/results/', '');

    res.set('Access-Control-Allow-Origin', 'https://github.com');
    res.set('Content-Type', 'application/json');

    var resultsFilePath = './results/' + fileHash + '.json';
    fs.exists(resultsFilePath, function(exists) {
        if (exists) {
            fs.readFile(resultsFilePath, function(err, data){
                res.end(data.toString());
            })
        } else {
            res.end(JSON.stringify({
                success: false,
                message: 'No results found.'
            }));
        }
    });
});

app.listen(7001);
