/**
 * node-maexle
 * discover module
 */

'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Cube = require('./cube.js'),
	Discover;

Discover = function Discover() {
	var d = this,
		dgram = require('dgram'),
		socket = dgram.createSocket('udp4'),
		foundCubes = {},
		sendBroadcast,
		interval;

	sendBroadcast = function DiscoverSendBroadcast() {
		var message = new Buffer('eQ3Max*.**********I', 'ascii');
		socket.send(message, 0, message.length, 23272, '255.255.255.255', function(error) {
			if(error) {
				d.emit('error', error);
			}
		});
	};

	socket.bind(23272, '0.0.0.0', function() {
		socket.setBroadcast(true);

		socket.on('message', function DiscoverReceiveInfo(data, rinfo) {
			if(rinfo.size !== 26 || data.toString('ascii', 0, 8) !== 'eQ3MaxAp' || foundCubes[rinfo.address]) {
				return;
			}

			var response = {
				ip: rinfo.address,
				serial: data.toString('ascii', 8, 18),
				rf: data.toString('hex', 21, 24).toUpperCase(),
				version: parseInt(data.toString('hex', 24, 26), 10).toString().split('').join('.'),

				connect: function() {
					return new Cube(rinfo.address);
				}
			};
			foundCubes[rinfo.address] = response;
			d.emit('cube', response);
		});

		interval = setInterval(sendBroadcast, 1000);
		sendBroadcast();
	});

	d.end = function DiscoverEnd() {
		if(interval) {
			clearInterval(interval);
			interval = null;
		}
		socket.close();
		this.emit('end');
	};
};


util.inherits(Discover, EventEmitter);
module.exports = Discover;