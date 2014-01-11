var serializeLogResult = require('./serialize-log-result').serializeLogResult;

describe('Serialization of non-string primitives', function(){
	it('Just calls toString on numbers and booleans', function(){
		expect(serializeLogResult(88.22)).toBe("88.22");
		expect(serializeLogResult(false)).toBe("false");
	})
	it('Should return the normal names for undefined and null', function(){
		expect(serializeLogResult(undefined)).toBe("undefined");
		expect(serializeLogResult(null)).toBe("null");
	});
});
