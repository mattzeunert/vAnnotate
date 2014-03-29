/*
    Add annotations to Javascript files based on example html files that use them.

    Example use:

         node lib/vAnnotate.js site test.html output

    The first argument is the folder containing the Html and Javascript code,
    the second argument specifies the the path within the folder.
    (The example above would open the file ./site/test.html)
    The third argument is the output folder for the annotated Javascript code.

    Also: just `node lib/vAnnotate.js` will serve the current working directory.
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
            page.open('http://localhost:4000' + htmlFile, function(){
                setTimeout(function(){
                    // Todo: don't just pray and hope that the results are in...
                    process.exit(code=0)
                }, 500)
            })
        })
    })
}
