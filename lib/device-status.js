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
        data = new Data(),
        device = o.device,
        connection = o.connection;

    data.setParent(this);
    data.setAttributes([
        'mode',
        'dstActive',
        'gatewayKnown',
        'panelLocked',
        'linkError',
        'batteryLow',
        'initialized',
        'error',
        'valid',

        // sometimes…
        'valvePosition',
        'setTemperature',
        'setUntil',
        'actualTemperature',

        // window Switches
        'open'
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
        req.type('l');
        req.responseType('L');
        connection.send(req);
    };


    // listen for C event
    connection.on('data:L', function(e) {
        var content = new Buffer(e.text, 'base64'),
            pointer = 0,
            length = 0,
            lineEnd = 0,
            found = false,
            result = {},
            rfAddress,
            b;

        do {
            length = content.readUInt8(pointer);
            lineEnd = pointer + length;
            rfAddress = content.toString('hex', pointer + 1, pointer + 4).toUpperCase();
            if(rfAddress === device.rf) {
                found = true;
                break;
            }

            pointer = lineEnd + 1;
        } while(content.toString('binary', pointer, pointer + 1));

        // This should never happen…
        if(!found) {
            return;
        }

        // basic flags
        b = new BitsHelper(content, pointer + 5).splice();
        result.valid = !!b[3];
        result.error = !!b[4];
        result.initialized = !!b[6];

        // status flags
        b = new BitsHelper(content, pointer + 6).splice();
        result.batteryLow = b[0] > 0;
        result.linkError = b[1] > 0;
        result.panelLocked = b[2] > 0;
        result.gatewayKnown = b[3] > 0;
        result.dstActive = b[4] > 0;

        if(device.type === 4) {
            result.open = b[6] > 0;
        }

        // mode
        if([1, 2, 3].indexOf(device.type) > -1) {
            if(b[5] > 0 && b[6] > 0) {
                result.mode = 'boost';
            }
            else if(b[5] > 0) {
                result.mode = 'vacation';
            }
            else if(b[6] > 0) {
                result.mode = 'manual';
            }
            else {
                result.mode = 'auto';
            }
        }

        if(length <= 6) {
            data.set(result);
            return;
        }

        // valve position
        result.valvePosition = content.readUInt8(7) !== 4 ? content.readUInt8(7) : null;

        // set temperature
        b = new BitsHelper(content, pointer + 8).splice();
        result.setTemperature = parseInt(b[2] + b[3] + b[4] + b[5] + b[6] + b[7], 2) / 2;

        /*b = [
            new BitsHelper(content, pointer + 9).splice(),
            new BitsHelper(content, pointer + 10).splice(),
            0
        ];
        b[3] = content.readUInt8(11) * 30;
        result.setUntil = new Date(
            parseInt(b[1][3] + b[1][4] + b[1][5] + b[1][6] + b[1][7], 2) + 2000,
            parseInt(b[0][0] + b[0][1] + b[0][2] + b[1][1], 2) - 1,
            parseInt(b[0][3] + b[0][4] + b[0][5] + b[0][6] + b[0][7], 2),
            Math.floor(b[3] / 60),
            Math.round(b[3] % 60)
        );*/

        // actual temperature for thermostats
        /*if([1, 2].indexOf(device.type) > -1) {
            b = [
                new BitsHelper(content, pointer + 8).splice(),
                new BitsHelper(content, pointer + 9).splice()
            ];
            result.actualTemperature = parseInt(
                b[0][7] +
                b[1][0] +
                b[1][1] +
                b[1][2] +
                b[1][3] +
                b[1][4] +
                b[1][5] +
                b[1][6] +
                b[1][7],
                2
            );
        }*/

        // actual temperature for wall thermostats
        if(device.type === 3 && length >= 12) {
            b = [
                new BitsHelper(content, pointer + 8).splice(),
                new BitsHelper(content, pointer + 12).splice()
            ];
            result.actualTemperature = parseInt(
                b[0][0] +
                b[1][0] +
                b[1][1] +
                b[1][2] +
                b[1][3] +
                b[1][4] +
                b[1][5] +
                b[1][6] +
                b[1][7],
                2
            ) / 10;
        }

        data.set(result);
    });
};

util.inherits(DeviceConfig, EventEmitter);
module.exports = DeviceConfig;
