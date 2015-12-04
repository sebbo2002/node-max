/**
 * examples/test.js
 */

'use strict';

var maexle = require('../'),
	cube = maexle.connect({
		ip: '192.168.2.23'
	});


cube.on('change', function() {
	console.log('\nCube:');
	console.log(cube.toJSON());
});

cube.on('room', function(room) {
	console.log('\nRoom: %s', room.name);
	console.log(room.toJSON());
});

cube.on('device', function(device) {
    console.log('\nDevice: %s%s', device.name, device.getRoom() ? ' in room ' + device.getRoom().name : '');
	console.log(device.toJSON());
    console.log(device.getConfig().toJSON());
});

setTimeout(function() {
	cube.connection().close();
}, 2000);