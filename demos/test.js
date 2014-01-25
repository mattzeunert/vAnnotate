function maker(obj){
	return obj;
}

var a = 44;

var thing = {
	sayHi: function(){
		var ret = 4 * 2;
		return ret;
	}
};

thing.sayHi();


var thing = maker({
	sayHi: function(){
		var ret = 4 * 2;
		return ret;
	}
});

thing.sayHi();

