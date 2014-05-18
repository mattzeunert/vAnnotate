/*

    Essentially allows file system access with a different root path.

    Initialize with create('~/something') and exists('hello') will check the file ~/something/hello.

*/

var fs = require('fs'),
    promisedFs = require('promised-io/fs')
    helper = require('./helper');

exports.create = function(rootPath){
    function checkPathAccess(path){
        if (!helper.pathIsSubdirectory(rootPath + path, rootPath)){
            throw 'Path ' + rootPath + path + ' isn\'t a subdirectory of ' + rootPath;
        }
    }
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
    var retServerFs = {};
    for (fn in serverFs){
        (function(fn){
            retServerFs[fn] = function(path){
                checkPathAccess(path, rootPath)
                return serverFs[fn].apply(this, arguments);
            }
        })(fn)
    }
    return retServerFs;
}

