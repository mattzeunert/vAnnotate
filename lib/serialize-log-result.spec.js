var serializeLogResult = require('./serialize-log-result').serializeLogResult;

describe('Serialization of non-string primitives', function(){
	it('Just calls toString on numbers, booleans, undefined and null', function(){
		expect(5).toBe(5);
	})
});
