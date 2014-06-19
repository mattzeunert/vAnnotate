var serializeLogResult = require('./serialize-log-result').serializeLogResult,
    _countObjectProperties = require('./serialize-log-result')._countObjectProperties;

describe('Serialization of non-string primitives', function(){
    it('Just calls toString on numbers and booleans', function(){
        expect(serializeLogResult(88.22)).toBe("88.22");
        expect(serializeLogResult(false)).toBe("false");
    })
    it('Should return the normal names for undefined and null', function(){
        expect(serializeLogResult(undefined)).toBe("undefined");
        expect(serializeLogResult(null)).toBe("null");
    });
    it('Should handle arrays decently', function(){
        expect(serializeLogResult([1,2,3])).toEqual({
            vaType: 'list',
            items: ['1', '2', '3'],
            length: 3
        });
        expect(serializeLogResult(['1','2','3'])).toEqual({
            vaType: 'list',
            items: ['"1"', '"2"', '"3"'],
            length: 3
        });
    });
    it('Should just return strings the way they are', function(){
        expect(serializeLogResult('string')).toBe('"string"');
    });

    it('Should be able to count object properties', function(){
        expect(_countObjectProperties({a: 1, b:2})).toEqual({
            total: 2,
            functions: 0,
            values:2,
            isMinimum: false
        });
    })
});
