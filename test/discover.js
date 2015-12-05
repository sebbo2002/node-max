'use strict';

var assert = require('assert'),
	maexle = require('../'),
	Discover = maexle.Discover;

describe('discover module', function() {
	describe('#constructor()', function() {
		it('should work without cubes', function() {
			var discover = new Discover();
			discover.end();
			assert.ok(true);
		});

		it('should find at least one cube', function(cb) {
			var discover = new Discover();
			discover.once('cube', function() {
				discover.end();
				assert.ok(true);
				cb();
			});
		});

		it('cubes should have a working connect() method', function(cb) {
			var discover = new Discover();
			discover.once('cube', function(cube) {
				discover.end();

				var instance = cube.connect();
				assert.ok(instance);
				assert.ok(instance instanceof maexle.Cube);
				instance.close(cb);
			});
		});
	});
});