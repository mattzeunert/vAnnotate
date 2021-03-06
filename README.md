vAnnotate
=========

Annotates variables in Javascript code with the values they take during execution.

You'll need a static html page that links Javascript files

## Installation

    sudo npm install -g vannotate

(Or download the Github repo and run node lib/vAnnotate.)

## Usage

    vAnnotate

This will make the current working directory accessible at [http://localhost:7000](http://localhost:7000).

In there you can open the static html file. vAnnotate will collect the annotation data and the annotated code is made available at [http://localhost:7000/vAnnotate/results](http://localhost:7000/vAnnotate/results).

### Additional command-line options

    vAnnotate --port 1234

Change port where static files are served.

## How it works

vAnnotate creates a static files server to serve the Html and Javascript code. When a .js file is requested it injects
logging instructions into the file, for example for function calls and variable assignments.

## Known issues

- Logging assignments to member expressions can currently have side effects. For example if you run `a[fn()] = b` fn will be called twice - once for the assignment and once for the logging call.
To fix this we need to move the object properties to separate variables before doing the assignment and the logging.

## Running the tests

Install PhantomJS and jasmine-node, then run `jasmine-node .`.