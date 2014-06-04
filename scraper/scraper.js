$ = require('jquery-deferred');
var exec = require('child_process').exec;

var repos = [
    //'jashkenas/underscore',
    //'jashkenas/backbone',
    //'mattzeunert/vAnnotate',
    // 'bgrins/TinyColor',
    // 'mattzeunert/minmal-Backbone.localStorage-example',
    // 'jdsharp/jquery-examples',
    'tastejs/todomvc/gh-pages',
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

    var repo = repos[i]
    var branch = 'master';
    var repoParts = repo.split('/');
    if (repoParts.length > 2){
        branch = repoParts.pop();
        repo = repoParts.join('/')
    }

    var url = 'https://codeload.github.com/' + repo + '/zip/' + branch;
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
            console.log('running command: ' + cmd)
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



