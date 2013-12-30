var fs = require('fs');

exports.create = function(rootPath){
	var serverFs = {
		readFile: function(path, callback){
		    fs.readFile(rootPath + path, function(err, data){
		        callback(err, data && data.toString());
		    });
		}
	}
	return serverFs
}

