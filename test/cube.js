'use strict';

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
    after(function(cb) {
        cube.close(cb);
    });

	describe('#constructor()', function() {
		describe('#get/set/toJSON', function() {
			it('should cry when no ip is given', function() {
				assert.throws(function() {
					maexle.connect({
						ip: null
					});
				}, /IP/);
			});

			it('should setup change events', function(cb) {
				var c = 0;
				function check() {
					c += 1;
					if(c === 2) {
						cb();
					}
				}
				cube.once('change', function() {
					check();
				});
				cube.once('change:serial', function(value) {
					assert.ok(value);
					check();
				});
			});

			it('should have a working get()', function() {
				assert.equal(typeof cube.get, 'function');
				assert.ok(cube.get('serial'));
                assert.equal(cube.get('serial'), cube.serial);
				assert.throws(function() {
					cube.get('foo');
				}, /Unknown attribute/);
			});

			it('should have working attributes', function() {
				assert.ok(cube.serial);
			});

			it('should have a working toJSON()', function() {
				var json = cube.toJSON();
				assert.ok(json);
				assert.ok(json.serial);
			});
		});


		describe('#hello', function() {
			it('should set the serial number', function() {
				assert.ok(cube.serial);
				assert.ok(/^[A-Z]{3}[0-9]{7}$/.test(cube.serial));
			});

			it('should set the rf address', function() {
				assert.ok(cube.rf);
				assert.ok(/^[0-9A-F]{6}$/.test(cube.rf));
			});

			it('should set the firmware version', function() {
				assert.ok(cube.firmware);
				assert.ok(/^[0-9]{1,2}\.[0-9]\.[0-9]$/.test(cube.firmware));
			});

			it('should set the http connection ID', function() {
				assert.ok(cube.httpConnectionId);
			});

			it('should set the dutyCycle', function() {
				assert.ok(cube.dutyCycle);
				assert.equal(typeof cube.dutyCycle, 'number');
			});

			it('should set the free memory', function() {
				assert.ok(cube.freeMemory);
				assert.equal(typeof cube.freeMemory, 'number');
			});

			it('should set the timeOffset', function() {
				assert.equal(typeof cube.timeOffset, 'number');
			});
		});
	});
});