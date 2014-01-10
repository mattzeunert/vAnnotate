
function testMethod(test){
	var a = 1 + 1;
	
	console.log(a)
	
	a = 'test';

	var c,d;
	c = 5;
	d = 10;
	c *= d;

}

// Todo: turn these into specs
// need to break up add into two functions, return statement handling and param handling

function add(a, b){
	return a + b;
}

function singleVar(){
	var a = 5;
}

function multiVar(){
	var a = 1, b = 2,c = 3;
}