/**
 * node-maexle
 * device module
 */

'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Device;


Device = function Device(link) {
	var d = this,
		data = {},
		attributes = ['serial', 'rf', 'type', 'name', 'roomId'],
		_set;


	// set attributes
	_set = function DeviceSetValue(key, value) {
		if(data[key] !== value) {
			data[key] = value;
			d.emit('change:' + key, d, value);
			d.emit('change', d);
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
	d.get = function DeviceGet(attribute) {
		if(attributes.indexOf(attribute) === -1) {
			throw 'This attribute doesn\'t exist in Device';
		}

		return data[attribute];
	};

	attributes.forEach(function(attribute) {
		Object.defineProperty(d, attribute, {
			get: function() {
				return d.get(attribute);
			}
		});
	});

	d.toJSON = function() {
		var obj = {};
		attributes.forEach(function(attribute) {
			obj[attribute] = d.get(attribute);
		});
		return obj;
	};

	d.getRoom = function() {
		return link.room ? link.room.object : null;
	};
};


util.inherits(Device, EventEmitter);
module.exports = Device;