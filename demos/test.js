/*









TODO: revisit best way to append to body/modify body in log injector...









*/

a=5;
var test = function(a,b,c){
//var sth = 'hi';
}

// function test(a,b,c){
//
// }
test(4,5,2);

// var breaker = {};

//     var each = function(obj, iterator, context) {
//     if (obj == null) return obj;
//     if (false && nativeForEach && obj.forEach === nativeForEach) {
//       obj.forEach(iterator, context);
//     } else if (obj.length === +obj.length) {
//       for (var i = 0, length = obj.length; i < length; i++) {
//         if (iterator.call(context, obj[i], i, obj) === breaker) return;
//       }
//     } else {
//       var keys = _.keys(obj);
//       for (var i = 0, length = keys.length; i < length; i++) {
//         if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
//       }
//     }
//     return obj;
//   };

//   map = function(obj, iterator, context) {
//     var results = [];
//     if (obj == null) return results;
//     each(obj, function(value, index, list) {
//       results.push(iterator.call(context, value, index, list));
//     });
//     return results;
//   };

//   var res = map([1,2,3], function(n){
//     return n *2 ;
//   })

//   console.log(res);














// function registerLoggingCallback( ) {
//   return function( callback ) {
//     var a = 'kkkkk';
//   };
// }

// registerLoggingCallback()()


// // Assigning a function expression, should log arguments
// var a = function(a,b){

// }


// // If statement with an expression statement instead of a body/block statement

// function test(arg){
//     if (!arg) return;
//     alert(arg);
// }

// test('hi');


// //Function defined inside a Member Expression:

// (function(){
//     var a = 5;
//     document.title = 5;
// }).call();

// var namespace = {
//   maker: function(obj){
//     return obj;
//   }
// }

//  var maker = function(obj){
//     return obj;
//   }




// var thing = {};
// thing= maker({
//  sayHi: function(){
//    var ret = 4 * 2;
//     console.log(ret);
//    return ret;
//  }
// });

// thing.sayHi();


// var thing = {};
// var thing= maker({
//   sayHi: function(){
//     var ret = 4 * 2;
//     console.log(ret);
//     return ret;
//   }
// });

// thing.sayHi();


// function gggg(a,b){
//   a= 222;
// }
// gggg(5,'test');






// /*
// a = {};
// a.ss = 5 + 4;

// var a = function(){
//   line1 = 2;
// }

// // for loop
// for (var i=0; i<3;i++){

// }

// if (true){
//   var obj = {};
//   obj.hidden = "you can't find me";
// }
// */
// /*
// function test(){
//     return function(){
//             var a = 5;
//             document.title= a;
//         }
// }
// test()();

// var obj = {
//     fn: function(){
//         return function(){
//             var a = 5;
//             document.title= a;
//         }
//     }
// }
// obj.fn()()
// */
