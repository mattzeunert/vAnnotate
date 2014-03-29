module.exports = function(value, level){
    level = level || 'debug';

    if (level === 'always'){
        console.log(value);
    }
}
