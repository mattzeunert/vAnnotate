/*

	These tests span the logging injection, server and annotation generation.
	By combining these we can test that the annotations are added and correctly evaluated at the same time.

*/

var mkdirp = require('mkdirp');
var fs = require('fs');
var helper = require('./helper');
var serialize = require('./serialize-log-result').serializeLogResult;



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
            console.log('OUTPUT:', stdout)
            console.log('ERRORS:', stderr)
			fs.readFile('./vAnnotateTestSite/out.json', function(err, data){
                try {
    				var results = JSON.parse(data.toString());
    				console.log('Results:', results)

    				expectedAnnotations.forEach(function(expectation, i){
    					var fileContents = fs.readFileSync('./vAnnotateTestSite' + '/' + i + '.js')
                        console.log('file: ', i);
    					var fileResults = results[helper.sha1(fileContents)];
                        console.log('fileResults', fileResults)
    					expectation.annotations.forEach(function(annotation, i){
                            if (!annotation.ignore === true){
        						expect(fileResults[i]).toBe(annotation.value);
                            }
    					});
    				})

    				var rmdir = require('rimraf');
    				rmdir('./vAnnotateTestSite', function(){});

    				done = true;
                }
                catch (err){
                    // Our own error message because jasmine doesn't like the normal asyn ones

                    console.log('FAIL');
                    console.log(err);
                    console.log("==",err.stack,"==")
                }
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
					value: '5'
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
					value: '2'
				}
			]
		})

		expectAnnotations({
			code: 'function fnAnnotatesArgumentsAndReturnStatements3(){return Math.sqrt(9)};fnAnnotatesArgumentsAndReturnStatements3()',
			annotations: [
				{
					value: '3'
				}
			]
		})
	})

	it('Annotates variable declarations with the initial value', function(){
		expectAnnotations({
			code: 'var k = 12',
			annotations: [
				{
					value: '12'
				}
			]
		})
	})

    it('Annotates functions inside (nested) objects', function(){
        var lines = [
          	'var obj = {',
    		    'nested: {',
                    'run: function(){',
                        'var a = 5',
                    '}',
                '}',
            '};',
            'obj.nested.run();'
        ];
        var code = lines.join('');
        expectAnnotations({
            code: code,
            annotations: [
                {
                    // Because the code is bad we can't easily just pick out specific annotations to check for
                    // so we use ignore to add ones we don't care about.
                    ignore: true
                },
                {
                    value: '5'
                }
            ]
        });
    })


    it('Annotates functions that are passed as function parameters (e.g. callbacks)', function(){
        var lines = [
            'function fn(fn2)',
            '{fn2()};',
            'fn(function(){var a = 99})'
        ];
        var code = lines.join('');
        expectAnnotations({
            code: code,
            annotations: [
                {
                    ignore: true
                },
                {
                    value: '99'
                }
            ]
        });
    })

    it('Annotates trees that are the right hand side of an assignment', function(){
        var code = 'a = function(){var a=55};a()';
        expectAnnotations({
            code: code,
            annotations: [
                {
                    ignore: true
                },
                {
                    value: '55'
                }
            ]
        });
    })

    it('Uses logs the variable value at when the program is run rather than when the logs are saved', function(){
        var code = 'var a = {};a.test=33';
        expectAnnotations({
            code: code,
            annotations: [
                {
                    value: serialize({})
                }
            ]
        });
    })

	runs(function(){
		createAnnotations();
	})
});
