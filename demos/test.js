
function registerLoggingCallback( ) {
  return function( callback ) {
    var a = 'kkkkk';
  };
}

registerLoggingCallback()()


// Assigning a function expression, should log arguments
var a = function(a,b){

}


// If statement with an expression statement instead of a body/block statement

function test(arg){
    if (!arg) return;
    alert(arg);
}

test('hi');


//Function defined inside a Member Expression:

(function(){
    var a = 5;
    document.title = 5;
}).call();

var namespace = {
  maker: function(obj){
    return obj;
  }
}

 var maker = function(obj){
    return obj;
  }




var thing = {};
thing= maker({
	sayHi: function(){
		var ret = 4 * 2;
    console.log(ret);
		return ret;
	}
});

thing.sayHi();


var thing = {};
var thing= maker({
  sayHi: function(){
    var ret = 4 * 2;
    console.log(ret);
    return ret;
  }
});

thing.sayHi();


function gggg(a,b){
  a= 222;
}
gggg(5,'test');






/*
a = {};
a.ss = 5 + 4;

var a = function(){
  line1 = 2;
}

// for loop
for (var i=0; i<3;i++){

}

if (true){
  var obj = {};
  obj.hidden = "you can't find me";
}
*/
/*
function test(){
    return function(){
            var a = 5;
            document.title= a;
        }
}
test()();

var obj = {
    fn: function(){
        return function(){
            var a = 5;
            document.title= a;
        }
    }
}
obj.fn()()
*/
