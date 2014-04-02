/*
    Command line wrapper for vAnnotate server. See Readme.md for instructions.
*/

var server = require('./server'),
    ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser();
parser.addArgument(
    ['rootPath'],
    {
        nargs: '?',
        defaultValue: ['.']
    }
);
parser.addArgument(
    ['htmlFile'],
    {
        nargs: '?'
    }
);
parser.addArgument(
    ['-p', '--port'],
    {
        defaultValue: 4000
    }
);
parser.addArgument(
    ['--json-output']
);

args = parser.parseArgs();


var options = args;

options.outputFormat = server.outputFormats.ANNOTATED_CODE;
if (args.json_output){
    options.outputFormat = server.outputFormats.JSON;
}

options.outputDirectory = args.json_output;

var serverInstance = server.start(options);

if (args.json_output){

    var htmlFile = args.htmlFile;
    if (htmlFile[0] !== '/'){
        htmlFile = '/' + htmlFile;
    }

    var phantom = require('phantom');
    phantom.create(function(ph){
        ph.createPage(function(page){
            page.open('http://localhost:' + options.port + htmlFile, function(){
                setTimeout(function(){
                    // Todo: don't just pray and hope that the results are in...
                    process.exit(code=0)
                }, 500)
            })
        })
    })
}
