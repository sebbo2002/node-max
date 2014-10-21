/**
 * node-maexle
 * room module
 */

'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Room;


Room = function Room(link) {
	var r = this,
		data = {},
		devices = {},
		attributes = ['id', 'name', 'groupRF'],
		_set;


	// set attributes
	_set = function RoomSetValue(key, value) {
		if(data[key] !== value) {
			data[key] = value;
			r.emit('change:' + key, r, value);
			r.emit('change', r);
		}
	};
	link.on('set', function(data) {
		var i;
		for(i in data) {
			if(data.hasOwnProperty(i)) {
				_set(i, data[i]);
			}
		}
	});


	// getter
	r.get = function RoomGet(attribute) {
		if(attributes.indexOf(attribute) === -1) {
			throw 'This attribute doesn\'t exist in Room';
		}

		return data[attribute];
	};

	attributes.forEach(function(attribute) {
		Object.defineProperty(r, attribute, {
			get: function() {
				return r.get(attribute);
			}
		});
	});

	r.toJSON = function() {
		var obj = {};
		attributes.forEach(function(attribute) {
			obj[attribute] = r.get(attribute);
		});
		return obj;
	};
};


util.inherits(Room, EventEmitter);
module.exports = Room;