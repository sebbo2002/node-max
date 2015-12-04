'use strict';

var assert = require('assert'),
	maexle = require('../');

describe('core module', function() {
	describe('#connect()', function() {
		it('should return a cube', function() {
			var cube = maexle.connect({
				ip: 'max.local'
			});

			assert.ok(cube);
			assert.ok(cube instanceof maexle.Cube);
		});
	});

	describe('#discover()', function() {
		it('should return a discover object', function() {
			var discover = maexle.discover();
			assert.ok(discover);
			assert.ok(discover instanceof maexle.Discover);
		});
	});
});