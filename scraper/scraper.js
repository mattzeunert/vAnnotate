$ = require('jquery-deferred');
var exec = require('child_process').exec;

var repos = [
    'jashkenas/underscore'
]

var scrapingPath = process.env['HOME'] + '/vAScraping/';
var unzipPath = scrapingPath + 'unzip/';
var resultPath = scrapingPath + 'individual-results/';
var mergedResultPath = scrapingPath + 'results/'

var mkdirp = require('mkdirp');
mkdirp(scrapingPath)
mkdirp(unzipPath)
mkdirp(resultPath)
mkdirp(mergedResultPath)


var i = 0;

continueProcessing();



function continueProcessing(){
    var https = require('https');
    var fs = require('fs');

    var repoId = repos[i].replace(/\//g, '-').replace(/[^a-z0-9A-Z-_]/g,'') + '-' + new Date().toISOString().replace(/\:/g, '-')
    var scraperRoot = unzipPath
    var filePath = scraperRoot + repoId + '.zip'
    var file = fs.createWriteStream(filePath);
    var url = 'https://codeload.github.com/' + repos[i] + '/zip/master';
    console.log('Fetching, ', url)
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          console.log('Finished fetching')
          var unzipDirectory = scraperRoot + repoId
          var cmd = 'unzip ' + filePath + ' -d ' + unzipDirectory
          console.log(cmd)
          exec(cmd, function(){
            console.log('unzipped')
            cmd = 'node lib/vAnnotate ' + unzipDirectory;
            cmd += ' --htmlFileV2=ALL --outputDirectoryV2=' + resultPath;
            exec(cmd, function(){
                i++;
                if (i==repos.length){
                    merge();
                }
                else {
                    continueProcessing();
                }
            })


          })
        });
    });
}

function merge(){
    var cmd = "node lib/vAnnotate --mergeResultDirectory=" + resultPath + " --mergeResultOutputDirectory=" + mergedResultPath;
    exec(cmd, function(){
        console.log(arguments)
        console.log('---DONE----')
    })
}



