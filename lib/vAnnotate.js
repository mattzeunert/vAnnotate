/*

	

*/

var server = require('./server');



var userArgs = process.argv.slice(2);
var htmlFile = userArgs[1]

if (htmlFile[0] !== '/'){
	htmlFile = '/' + htmlFile;
}

var serverInstance = server.start({
	rootPath: userArgs[0]
});

var phantom = require('phantom');
phantom.create(function(ph){
    ph.createPage(function(page){
        page.open('http://localhost:3000' + htmlFile, function(){
            console.log('opened')
            setTimeout(function(){
                // Todo: don't just pray and hope that the results are in...
                process.exit(code=0)            
            }, 500)
        })
    })
})

