$ = require('jquery-deferred');
var exec = require('child_process').exec;

var repos = [
    'jashkenas/underscore'
]

var i = 0;
continueProcessing();

function continueProcessing(){
    var https = require('https');
    var fs = require('fs');

    require('mkdirp')('/tmp/vAScraping/')
    var repoId = repos[i].replace(/\//g, '-').replace(/[^a-z0-9A-Z-_]/g,'') + '-' + new Date().toISOString().replace(/\:/g, '-')
    var scraperRoot = '/tmp/vAScraping/';
    var filePath = scraperRoot + repoId + '.zip'
    var file = fs.createWriteStream(filePath);
    var url = 'https://codeload.github.com/' + repos[i] + '/zip/master';
    console.log('Fetching, ', url)
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          console.log('Finished fetching')
          var cmd = 'unzip ' + filePath + ' -d ' + scraperRoot + repoId
          console.log(cmd)
          exec(cmd, function(){
            console.log('unzipped')
          })
        });
    });


    // exec('node --version', function callback(error, stdout, stderr){
    //     console.log(stdout, stderr)
    // });

}

