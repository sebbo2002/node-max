var assert = require('assert'),
	maexle = require('../'),
	cube;

describe('cube module', function() {
	before(function(cb) {
		var discover = maexle.discover();
		discover.once('cube', function(_cube) {
			discover.end();
			cube = _cube.connect();
			cb();
		});
	});

	describe('#constructor()', function() {
		describe('#get/set/toJSON', function() {
			it('should cry when no ip is given', function() {
				assert.throws(function() {
					maexle.connect({
						ip: null
					});
				}, /Can\'t connect/);
			});

			it('should setup change events', function(cb) {
				var c = 0;
				function check() {
					c += 1;
					if(c === 2) {
						cb();
					}
				}
				cube.once('change', function(cube) {
					assert.ok(cube);
					check();
				});
				cube.once('change:serial', function(cube, value) {
					assert.ok(cube);
					assert.ok(value);
					check();
				});
			});

			it('should have a working get()', function() {
				assert.equal(typeof cube.get, 'function');
				assert.ok(cube.get('serial'));
				assert.throws(function() {
					cube.get('foo');
				}, /attribute doesn\'t exist/);
			});

			it('should have a working get', function() {
				assert.equal(cube.get('serial'), cube.serial);
			});

			it('should have a working toJSON()', function() {
				var json = cube.toJSON();
				assert.ok(json);
				assert.ok(json.serial);
			});
		});


		describe('#hello', function() {
			it('should set the serial', function() {
				assert.ok(cube.serial);
				assert.ok(/^[A-Z]{3}[0-9]{7}$/.test(cube.serial));
			});

			it('should set the rf', function() {
				assert.ok(cube.rf);
				assert.ok(/^[0-9A-F]{6}$/.test(cube.rf));
			});

			it('should set the version', function() {
				assert.ok(cube.version);
				assert.ok(/^[0-9]{1,2}\.[0-9]\.[0-9]$/.test(cube.version));
			});

			it('should set the httpConnectionID', function() {
				assert.ok(cube.httpConnectionID);
			});

			it('should set the dutyCycle', function() {
				assert.ok(cube.dutyCycle);
				assert.equal(typeof cube.dutyCycle, 'number');
			});

			it('should set the memory', function() {
				assert.ok(cube.memory);
				assert.equal(typeof cube.memory, 'number');
			});

			it('should set the timeOffset', function() {
				assert.equal(typeof cube.timeOffset, 'number');
			});
		});
	});
});