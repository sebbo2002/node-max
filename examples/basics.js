/**
 * examples/basic.js
 * Discovers all your MAX! Cubes and show some data. Hopefully.
 */

'use strict';

var max = require('../'),
    discover = max.discover();

discover.once('cube', function(c) {
    var cube = c.connect();
    discover.end();

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
        console.log(device.getStatus().toJSON());
    });

    cube.once('sync', function() {
        cube.close();
    });
});