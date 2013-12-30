/*
	Add annotations to Javascript files based on example html files that use them.

	Example use:

		 node lib/vAnnotate site test.html output

	The first argument is the folder containing the Html and Javascript code,
	the second argument specifies the the path within the folder.
	(The example above would open the file ./site/test.html)
	The third argument is the output folder for the annotated Javascript code.
*/

var server = require('./server');



var userArgs = process.argv.slice(2);
var htmlFile = userArgs[1]

if (htmlFile[0] !== '/'){
	htmlFile = '/' + htmlFile;
}

// JSON output for automated processing instead of Html file with annotated code
var outputFormat = server.outputFormats.ANNOTATED_CODE;
if (userArgs[3] === '--json-output'){
	outputFormat = server.outputFormats.JSON;
}

var serverInstance = server.start({
	rootPath: userArgs[0],
	outputDirectory: userArgs[2],
	outputFormat: outputFormat
});

var phantom = require('phantom');
phantom.create(function(ph){
    ph.createPage(function(page){
        page.open('http://localhost:3000' + htmlFile, function(){
            setTimeout(function(){
                // Todo: don't just pray and hope that the results are in...
                process.exit(code=0)            
            }, 500)
        })
    })
})

