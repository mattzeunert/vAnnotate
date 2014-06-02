/*

Todo: logging shoudl work like this:

quiet - only show if 'always' is set
normal
verbose
debug - loads of extra info useful to users
dev - all the infos



*/

module.exports = function(value, level){
    level = level || 'debug';

    if (level === 'verbose'){
        // Todo: only log if verbose is actually set
        console.log(value)
    }
    if (level==='dev'){
        console.log(value)
    }
    if (level === 'normal'){
        console.log(value)
    }
    if (level === 'always'){
        console.log(value);
    }
}
