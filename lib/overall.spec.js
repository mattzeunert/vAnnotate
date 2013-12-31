/*

	These tests span the logging injection, server and annotation generation.
	By combining these we can test that the annotations are added and correctly evaluated at the same time.

*/

var mkdirp = require('mkdirp');
var fs = require('fs');
var helper = require('./helper');



var expectedAnnotations = [];

function expectAnnotations(options){
	expectedAnnotations.push(options)
}

function createAnnotations(){	


    var Promise = require("promised-io/promise");

    var pFs = require('promised-io/fs');
	var siteDirectory = './vAnnotateTestSite/';

	mkdirp(siteDirectory, function(){
		var promises = [];

		var html = '';
		expectedAnnotations.forEach(function(annotation, i){
			var filename = i + '.js';
			var promise = pFs.writeFile(siteDirectory + filename, annotation.code);
			promises.push(promise);
			html += '<script src="' + filename + '"></script>';
		})

		promises.push(pFs.writeFile(siteDirectory + 'tests.html', html));

		Promise.all(promises).then(function(){
			checkAnnotations();
		})
	});


	function checkAnnotations(){
		// Starting an external process because I couldn't figure out
		// how to make jasmine happy with running the node phantom wrapper.
		var exec = require('child_process').exec;
		exec('node lib/vAnnotate vAnnotateTestSite tests.html vAnnotateTestSite/out.json --json-output', function callback(error, stdout, stderr){
			fs.readFile('./vAnnotateTestSite/out.json', function(err, data){
				var results = JSON.parse(data.toString());
				console.log('red', results)

				expectedAnnotations.forEach(function(expectation, i){
					var fileContents = fs.readFileSync('./vAnnotateTestSite' + '/' + i + '.js')
					var fileResults = results[helper.sha1(fileContents)];
					expectation.annotations.forEach(function(annotation, i){
						expect(fileResults[i]).toBe(annotation.value);
					});
				})

				var rmdir = require('rimraf');
				rmdir('./vAnnotateTestSite', function(){});

				done = true;
			});
		});
	}

	var done = false;
	waitsFor(function(){
		return done;
	}, 'Didn\'t complete annotations in time.', 3000 * 10000000)
		

}


describe('Create annotations', function(){

	it('Annotates variable assignments with the assigned value', function(){
		expectAnnotations({
			code: 'a = 5',
			annotations: [
				{
					value: 5
				}
			]
		})

		
	})

	it('Annotates arguments with the passed value and return statements with the returned value', function(){
		expectAnnotations({
			code: 'function fnAnnotatesArgumentsAndReturnStatements(a){return a};fnAnnotatesArgumentsAndReturnStatements("test")',
			annotations: [
				{
					value: "test"
				},
				{
					value: "test"
				}
			]
		})

		expectAnnotations({
			code: 'function fnAnnotatesArgumentsAndReturnStatements2(){return 1+1};fnAnnotatesArgumentsAndReturnStatements2()',
			annotations: [
				{
					value: 2
				}
			]
		})

		expectAnnotations({
			code: 'function fnAnnotatesArgumentsAndReturnStatements3(){return Math.sqrt(9)};fnAnnotatesArgumentsAndReturnStatements3()',
			annotations: [
				{
					value: 3
				}
			]
		})
	})

	it('Annotates variable declarations with the initial value', function(){
		expectAnnotations({
			code: 'var k = 12',
			annotations: [
				{
					value: 12
				}
			]
		})
	})
	
	runs(function(){
		createAnnotations();
	})

	

});
