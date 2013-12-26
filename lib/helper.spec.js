var helper = require('./helper');

describe('endsWith', function(){
	it('should check for endings like file extensions', function(){
		expect(helper.endsWith('example.html', '.html')).toBe(true);
		expect(helper.endsWith('example', 'le')).toBe(true);
		expect(helper.endsWith('example', 'les')).toBe(false);
	})
})