/*
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
*/
var a = {};
var b = 33;
a.b = b;
a.sth = 555;
