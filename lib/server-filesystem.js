var fs = require('fs');

exports.create = function(rootPath){
	var serverFs = {
		readFile: function(path, callback){
		    fs.readFile(rootPath + path, function(err, data){
		        callback(err, data && data.toString());
		    });
		},
		exists: function(path, callback){
			fs.exists(rootPath + path, function(exists){
				console.log(path, exists)
				callback(exists);
			})
		},
		isDirectory: function(path, callback){
			fs.stat(rootPath + path, function(err, stats){
				callback(err, stats.isDirectory());
			});
		}
	}
	return serverFs;
}

