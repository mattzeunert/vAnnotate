function maker(obj){
	return obj;
}

var a = 44;

// Inside objects

var thing = {
	sayHi: function(){
		var ret = 4 * 2;
		return ret;
	}
};

thing.sayHi();

// Maker functions

var thing = maker({
	sayHi: function(){
		var ret = 4 * 2;
		return ret;
	}
});

thing.sayHi();

//nested object

var thing = {
	a: {
		sayHi: function(){
			var ret = 4 * 2;
			return ret;
		}
	}
};

thing.a.sayHi();

