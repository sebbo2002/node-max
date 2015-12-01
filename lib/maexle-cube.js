/**
 * node-maexle
 * cube module
 */

'use strict';

var util = require('util'),
	net = require('net'),
	EventEmitter = require('events').EventEmitter,
	Cube;


/*
	Events:
	 - change(cube)
	 - change:serial(cube,value)
	 - sync
	 - add:room
	 - remove:room
	 - destroy
	 - error

	Methods:
	 - __getter
	 - __setter
	 - get(key)
	 - set(key, value[, callback])
	 - getRooms()
	 - getRoom(id)
 */


Cube = function Cube(config) {
	if(!config || !config.ip) {
		throw 'Can\'t connect to cube without IP';
	}

	var c = this,
		data = {},
		shared = {},
		eventHandler = {},
		attributes = ['serial', 'rf', 'version', 'httpConnectionID', 'dutyCycle', 'memory', 'timeOffset'],
		_set,
		socket;

	shared.rooms = {};
	shared.devices = {};
	shared.cube = c;


	// set attributes
	_set = function CubeSetValue(key, value) {
		if(data[key] !== value) {
			data[key] = value;
			c.emit('change:' + key, c, value);
			c.emit('change', c);
		}
	};


	// getter
	c.get = function CubeGet(attribute) {
		if(attributes.indexOf(attribute) === -1) {
			throw 'This attribute doesn\'t exist in Cube';
		}

		return data[attribute];
	};

	attributes.forEach(function(attribute) {
		Object.defineProperty(c, attribute, {
			get: function() {
				return c.get(attribute);
			}
		});
	});

	c.toJSON = function() {
		var obj = {};
		attributes.forEach(function(attribute) {
			obj[attribute] = c.get(attribute);
		});
		return obj;
	};

	c.getRooms = function CubeGetRooms() {
		var result = [],
			i;

		for(i in shared.rooms) {
			if(shared.rooms.hasOwnProperty(i)) {
				result.push(shared.rooms[i].object);
			}
		}

		return result;
	};

	c.getRoom = function CubeGetRoom(identifier) {
		var i;

		if(shared.rooms.hasOwnProperty(identifier)) {
			return shared.rooms[identifier].object;
		}

		for(i in shared.rooms) {
			if(shared.rooms.hasOwnProperty(i) && shared.rooms[i].object.get('groupRF') === identifier) {
				return shared.rooms[i].object;
			}
		}

		return null;
	};


	// handle "hello" event
	eventHandler.H = function CubeHandleHello(a) {
		var helloData = a.input.split(','),
			dateStr = helloData[7],
			timeStr = helloData[8],
			time,
			now;

		now = new Date();
		now.setSeconds(0);
		now.setMilliseconds(0);
		time = new Date(
				'20' + parseInt(dateStr.substr(0, 2), 16),
				-1 + parseInt(dateStr.substr(2, 2), 16),
			parseInt(dateStr.substr(4, 2), 16),
			parseInt(timeStr.substr(0, 2), 16),
			parseInt(timeStr.substr(2, 2), 16)
		);

		_set('serial', helloData[0]);
		_set('rf', helloData[1].toUpperCase());
		_set('version', parseInt(helloData[2], 10).toString().split('').join('.'));
		_set('httpConnectionID', helloData[4]);
		_set('dutyCycle', parseInt(helloData[5], 16));
		_set('memory', parseInt(helloData[6], 16));
		_set('timeOffset', Math.round((time.getTime() - now.getTime()) / 60000));
		//_set('clock_set', parseInt(helloData[9], 16)); @todo What's that?

		c.emit('sync', c);
	};

	// handle "metadata" event
	eventHandler.M = require('./messages/m.js')(shared);

	// handle "configuration" event
	eventHandler.C = require('./messages/c.js')(shared);


	socket = net.connect({
		port: 62910,
		host: config.ip
	}, function() {
		c.emit('connect', c);
	});

	socket.on('data', function(d) {
		var text = d.toString('ascii', 2, d.length - 2),
			type = d.toString('ascii', 0, 1);

		if(eventHandler[type]) {
			eventHandler[type]({
				buffer: d,
				input: text
			});
		}/*else{
			//console.log(type, ' => ', text);
		}*/
	});

	socket.on('end', function() {
		c.emit('close', c);
	});
};


util.inherits(Cube, EventEmitter);
module.exports = Cube;