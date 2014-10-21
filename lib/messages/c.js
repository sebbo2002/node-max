module.exports = function(shared) {
	'use strict';

	// http://www.adreamerslair.nl/tag/max-cube/

	var EventEmitter = require('events').EventEmitter,
		BitsHelper = require('../helpers/bits.js'),
		Room = require('../maexle-room.js'),
		Device = require('../maexle-device.js');

	return function CubeHandleConfiguration(a) {
		var configurationData =	 a.input.split(','),
			deviceConfig = new Buffer(configurationData[1], 'base64'),
			deviceId = null,
			deviceData = {},
			pointer = 1,
			length = deviceConfig.readUInt8(0);

		console.log('\nconfig for device %s', configurationData[0]);

		deviceData.rf = deviceConfig.toString('hex', pointer, pointer + 3).toUpperCase();
		pointer += 3;

		deviceData.type = deviceConfig.readUInt8(pointer);
		pointer += 1;
		console.log('type: %s', ['Cube', 'RadiatorThermostat', 'RadiatorThermostatPlus', 'WallThermostat', 'ShutterContact', 'EcoButton'][deviceData.type]);

		deviceData.roomId = deviceConfig.readUInt8(pointer);
		pointer += 1;

		deviceData.version = deviceConfig.readUInt8(pointer);
		pointer += 1;

		deviceData['?1'] = deviceConfig.readUInt8(pointer);
		pointer += 1;

		deviceData.serial = deviceConfig.toString('hex', pointer, pointer + 10).toUpperCase();
		deviceId = deviceData.serial;
		pointer += 10;

		// Cube
//		if(deviceData.type === 0) {
//			console.log(deviceConfig.readUInt8(pointer));
//			console.log(deviceConfig.toString('hex', pointer));
//		}

		// Thermostat / Thermostat+ / WallThermostat
		if([1, 2, 3].indexOf(deviceData.type) > -1) {
			deviceData.temperatureComfort = deviceConfig.readUInt8(pointer) / 2;
			pointer += 1;

			deviceData.temperatureEco = deviceConfig.readUInt8(pointer) / 2;
			pointer += 1;

			deviceData.temperatureLimitMax = deviceConfig.readUInt8(pointer) / 2;
			pointer += 1;

			deviceData.temperatureLimitMin = deviceConfig.readUInt8(pointer) / 2;
			pointer += 1;
		}

		// Thermostat / Thermostat+
		if([1, 2].indexOf(deviceData.type) > -1) {
			deviceData.temperatureOffset = (deviceConfig.readUInt8(pointer) / 2) - 3.5;
			pointer += 1;

			deviceData.temperatureWindowOpen = deviceConfig.readUInt8(pointer) / 2;
			pointer += 1;

			deviceData.durationWindowOpen = deviceConfig.readUInt8(pointer) * 5;
			pointer += 1;

			deviceData.boostDuration = parseInt(BitsHelper(deviceConfig, pointer).splice(0, 2), 2) * 5;
			deviceData.boostValve = parseInt(BitsHelper(deviceConfig, pointer).splice(3, 7), 2) * 5;
			if(deviceData.boostDuration === 35) {
				deviceData.boostDuration = 60;
			}
			pointer += 1;

			// Saturday = 0
			deviceData.decalcificationDay = parseInt(BitsHelper(deviceConfig, pointer).splice(0, 2), 2);
			deviceData.decalcificationHour = parseInt(BitsHelper(deviceConfig, pointer).splice(3, 7), 2);
			pointer += 1;

			deviceData.maxValve = deviceConfig.readUInt8(pointer) / 255 * 100;
			pointer += 1;

			deviceData.valveOffset = deviceConfig.readUInt8(pointer) / 255 * 100;
			pointer += 1;
		}
	};
};