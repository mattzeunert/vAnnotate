var htmlFile = '/test.html';

var server = require('./server');

var serverInstance = server.start();

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

