vAnnotate
=========

Generates Javascript code annotations on variables, showing their real-use values.

## node lib/vAnnotate.js

This will make the current directory accessible at localhost:3000. So if the current folder contains a test.html file you can access it at http://localhost:3000/test.html.

When you open the test.html page the Javascript variable values will be sent back and you can access them at http://localhost:3000/vAnnotate/results.
The page will list all involved Javascript files and link to their annotated versions.

## node lib/vAnnotate.js static-site-directory html-file-path output-directory

This will generate html files in the output-directory containing the annoteated JS.