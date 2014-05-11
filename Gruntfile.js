module.exports = function(grunt) {

    grunt.initConfig({

    });

    grunt.registerTask('compile-bookmarklet', function(){
        function fileToString(filepath){
            var fileContents = grunt.file.read(filepath);
            fileContents = fileContents.replace(/\n/g, '\\n').replace(/\'/g, '\\\'').replace(/\"/g, '\\\"');
            return fileContents;
        }

        var generalCss = fileToString('lib/overlay-page-css.css');
        var generalJs = fileToString('lib/overlay-page-js.js');

        var bookmarkletJs = grunt.file.read('bookmarklet/bookmarklet-code.js');

        bookmarkletJs = bookmarkletJs.replace('{{generalCss}}', generalCss);
        bookmarkletJs = bookmarkletJs.replace('{{generalJs}}', generalJs);

        grunt.file.write('bookmarklet/bookmarklet.js', bookmarkletJs)

    })

};
