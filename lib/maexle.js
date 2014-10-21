/**
 * node-maexle
 * core module
 */

'use strict';

var Cube = require('./maexle-cube.js'),
	Discover = require('./maexle-discover.js');

module.exports = {
	Cube: Cube,
	Discover: Discover,

	connect: function(config) {
		return new Cube(config);
	},
	discover: function() {
		return new Discover();
	}
};