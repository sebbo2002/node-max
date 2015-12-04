'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    DeviceConfig;

/**
 * @author Sebastian Pekarek
 * @constructor DeviceConfig
 */
DeviceConfig = function(o) {
    var Data = require('./helpers/data.js'),
        Request = require('./helpers/request.js'),
        BitsHelper = require('./helpers/bits.js'),
        c = this,
        data = new Data(),
        device = o.device,
        connection = o.connection;

    data.setParent(this);
    data.setAttributes([
        // Thermostats
        'temperatureComfort',
        'temperatureEco',
        'temperatureLimitMax',
        'temperatureLimitMin',

        // Valves
        'temperatureOffset',
        'temperatureWindowOpen',
        'durationWindowOpen',
        'boostDuration',
        'boostValve',
        'decalcificationDay',
        'decalcificationHour',
        'maxValve',
        'valveOffset'
    ]);
    data.initialize();


    /**
     * Refresh Configuration
     *
     * @since 0.1.0
     * @returns {Room}
     */
    this.refresh = function() {
        var req = new Request();
        req.type('c');
        req.body(device.rf);
        req.responseType('C');
        connection.send(req);
    };


    // listen for C event
    connection.on('data:C', function(e) {
        var content = e.text.split(','),
            pointer = 1,
            result = {},
            config;

        if(content[0].toUpperCase() !== device.rf) {
            return;
        }

        config = new Buffer(content[1], 'base64');

        
        // basics
        result.rf = config.toString('hex', pointer, pointer + 3).toUpperCase();
        pointer += 3;

        result.type = config.readUInt8(pointer);
        pointer += 1;
        //console.log('type: %s', ['Cube', 'RadiatorThermostat', 'RadiatorThermostatPlus', 'WallThermostat', 'ShutterContact', 'EcoButton'][result.type]);

        result.roomId = config.readUInt8(pointer);
        pointer += 1;

        result.firmware = config.readUInt8(pointer);
        pointer += 1;

        //result['?1'] = config.readUInt8(pointer);
        pointer += 1;

        result.serial = config.toString('hex', pointer, pointer + 10).toUpperCase();
        pointer += 10;


        // Thermostat / Thermostat+ / WallThermostat
        if([1, 2, 3].indexOf(result.type) > -1) {
            result.temperatureComfort = config.readUInt8(pointer) / 2;
            pointer += 1;

            result.temperatureEco = config.readUInt8(pointer) / 2;
            pointer += 1;

            result.temperatureLimitMax = config.readUInt8(pointer) / 2;
            pointer += 1;

            result.temperatureLimitMin = config.readUInt8(pointer) / 2;
            pointer += 1;
        }

        // Thermostat / Thermostat+
        if([1, 2].indexOf(result.type) > -1) {
            result.temperatureOffset = (config.readUInt8(pointer) / 2) - 3.5;
            pointer += 1;

            result.temperatureWindowOpen = config.readUInt8(pointer) / 2;
            pointer += 1;

            result.durationWindowOpen = config.readUInt8(pointer) * 5;
            pointer += 1;

            result.boostDuration = parseInt(new BitsHelper(config, pointer).splice(0, 2), 2) * 5;
            result.boostValve = parseInt(new BitsHelper(config, pointer).splice(3, 7), 2) * 5;
            if(result.boostDuration === 35) {
                result.boostDuration = 60;
            }
            pointer += 1;

            // Saturday = 0
            result.decalcificationDay = parseInt(new BitsHelper(config, pointer).splice(0, 2), 2);
            result.decalcificationHour = parseInt(new BitsHelper(config, pointer).splice(3, 7), 2);
            pointer += 1;

            result.maxValve = config.readUInt8(pointer) / 255 * 100;
            pointer += 1;

            result.valveOffset = config.readUInt8(pointer) / 255 * 100;
            //pointer += 1;
        }

        data.set(result);
    });
};

util.inherits(DeviceConfig, EventEmitter);
module.exports = DeviceConfig;
