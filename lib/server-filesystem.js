var fs = require('fs');

exports.readFile = function(path, callback){
    fs.readFile('./site' + path, function(err, data){
        callback(err, data && data.toString());
    });
}