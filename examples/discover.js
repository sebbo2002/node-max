/**
 * examples/discover.js
 * Discovers all your MAX! Cubes. Hopefully.
 */

'use strict';

var maexle = require('../'),
	discover = maexle.discover();

console.log('Discovering MAX! Cubes…');

discover.on('cube', function(cube) {
	console.log('');
	console.log('## %s', cube.serial);
	console.log('IP Address: %s', cube.ip);
	console.log('RF Address: %s', cube.rf);
	console.log('Firmware Version: %s', cube.version);
});