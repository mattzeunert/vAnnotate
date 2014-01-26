/*

    Essentially allows file system access with a different root path.

    Initialize with create('~/something') and exists('hello') will check the file ~/something/hello.

*/

var fs = require('fs'),
	promisedFs = require('promised-io/fs')

exports.create = function(rootPath){
	var serverFs = {
		readFile: function(path, callback){
		    fs.readFile(rootPath + path, function(err, data){
		        callback(err, data && data.toString());
		    });
		},
		exists: function(path, callback){
			return promisedFs.exists(rootPath + path, function(exists){
				callback(exists);
			})
		},
		stat: function(path, callback){
			return promisedFs.stat(rootPath + path, function(err, stats){
				callback(err, stats.isDirectory());
			});
		},
		readDirSync: function(path){
			return fs.readdirSync(rootPath + path);
		}
	}
	return serverFs;
}

