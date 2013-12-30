/*

	These tests span the logging injection, server and annotation generation.
	By combining these we can test that the annotations are added and correctly evaluated at the same time.

*/

var mkdirp = require('mkdirp');
var fs = require('fs');

var expectedAnnotations = [];

function expectAnnotations(options){
	expectedAnnotations.push(options)
}

function createAnnotations(){	
	/*
		Unit tests still need to be done... 
		Maybe starting the server isn't done right or phantom or the phantom js wrapper aren't happy.

		var siteDirectory = './vAnnotateTestSite/';
		mkdirp(siteDirectory, function(){
			var html = '';
			expectedAnnotations.forEach(function(annotation, i){
				var filename = i + '.js';
				fs.writeFile(siteDirectory + filename, annotation.code);
				html += '<script src="' + filename + '"></script>';
			})

			fs.writeFile(siteDirectory + 'tests.html', html);
		});

	*/

}

describe('Create annotations', function(){

	it('Annotates variable assignments with the assigned value', function(){
		expectAnnotations({
			code: 'a = 5',
			annotations: [
				{
					startAt: 0,
					value: 5
				}
			]
		})

		createAnnotations();
	})

});
