vAnnotate
=========

Generates Javascript code annotations on variables, showing their real-use values.

## vAnnotate

This will make the current directory accessible at localhost:3000. So if the current folder contains a test.html file you can access it at http://localhost:3000/test.html.

When you open the test.html page the Javascript variable values will be sent back and you can access them at http://localhost:3000/vAnnotate/results.
The page will list all involved Javascript files and link to their annotated versions.

## vAnnotate /some/path

Serves the supplied path to collect annotation data.

## vAnnotate static-site-directory html-file-path output-directory

This will generate html files in the output-directory containing the annotated JS.

## Known limitations

- Logging assignments to member expressions can currently have side effects. For example if you run `a[fn()] = b` fn will be called twice - once for the assignment and once for the logging call.  
To fix this we need to move the object properties to separate variables before doing the assignment and the logging.
