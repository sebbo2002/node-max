module.exports = function(shared) {
	'use strict';

	var EventEmitter = require('events').EventEmitter,
		Room = require('../maexle-room.js'),
		Device = require('../maexle-device.js');

	return function CubeHandleMetadata(a) {
		var content = a.input.split(','),
			metadata = new Buffer(content[2], 'base64'),
			pointer = 3,
			roomCount = metadata.readUInt8(2),
			deviceCount,
			deviceData,
			isNew,
			id,
			nameLength,
			i;

		for(i = 0; i < roomCount; i += 1) {
			id = metadata.readUInt8(pointer);
			nameLength = metadata.readUInt8(pointer + 1);
			isNew = 0;
			pointer += 2;

			if(!shared.rooms[id]) {
				isNew = 1;
				shared.rooms[id] = new EventEmitter();
				shared.rooms[id].object = new Room(shared.rooms[id]);
				shared.rooms[id].devices = [];
			}

			shared.rooms[id].emit('set', {
				id: id,
				name: metadata.toString('utf8', pointer, pointer + nameLength),
				groupRF: metadata.toString('hex', pointer + nameLength, pointer + nameLength + 3).toUpperCase()
			});

			if(isNew) {
				shared.cube.emit('room', shared.rooms[id].object);
			}
			pointer += nameLength + 3;
		}

		deviceCount = metadata.readUInt8(pointer);
		pointer += 1;

		for(i = 0; i < deviceCount; i += 1) {
			deviceData = {};
			isNew = 0;

			/*
			 * Cube = 0,
			 * RadiatorThermostat = 1,
			 * RadiatorThermostatPlus = 2,
			 * WallThermostat = 3,
			 * ShutterContact = 4,
			 * EcoButton = 5
			 */
			deviceData.type = metadata.readUInt8(pointer);
			pointer += 1;

			deviceData.rf = metadata.toString('hex', pointer, pointer + 3).toUpperCase();
			pointer += 3;

			deviceData.serial = metadata.toString('hex', pointer, pointer + 10).toUpperCase();
			id = deviceData.serial;
			pointer += 10;

			deviceData.nameLength = metadata.readUInt8(pointer);
			pointer += 1;

			deviceData.name = metadata.toString('utf8', pointer, pointer + deviceData.nameLength);
			pointer += deviceData.nameLength;

			deviceData.roomId = metadata.readUInt8(pointer) || null;
			pointer += 1;

			if(!shared.devices[id]) {
				isNew = 1;
				shared.devices[id] = new EventEmitter();
				shared.devices[id].object = new Device(shared.devices[id]);

				shared.devices[id].room = deviceData.roomId ? shared.rooms[deviceData.roomId] : null;
				if(deviceData.roomId) {
					shared.rooms[deviceData.roomId].devices.push(shared.devices[id]);
				}
			}

			shared.devices[id].emit('set', {
				serial: deviceData.serial,
				type: deviceData.type,
				rf: deviceData.rf,
				name: deviceData.name,
				roomId: deviceData.roomId
			});

			if(isNew) {
				shared.cube.emit('device', shared.devices[deviceData.serial].object);
			}
		}
	};
};