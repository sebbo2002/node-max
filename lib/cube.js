'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Cube;

/**
 * @author Sebastian Pekarek
 * @constructor Cube
 */
Cube = function(config) {
    var Connection = require('./helpers/connection.js'),
        Data = require('./helpers/data.js'),
        _ = require('lodash'),
        c = this,
        data = new Data(),
        rooms = {},
        devices = {},
        buffer = {},
        connection;

    if(typeof config === 'string') {
        config = {ip: config};
    }
    if(typeof config !== 'object' || typeof config.ip !== 'string') {
        throw new Error('Not able to connect to cube without IP');
    }

    /** @var Connection */
    connection = new Connection(config);

    data.setParent(this);
    data.setAttributes(['serial', 'rf', 'firmware', 'httpConnectionId', 'dutyCycle', 'freeMemory', 'timeOffset']);
    data.initialize();


    /**
     * Get all rooms
     *
     * @since 0.1.0
     * @returns {Room[]}
     */
    this.getRooms = function() {
        return _.values(rooms);
    };


    /**
     * Get room by id, name or groupRF
     *
     * @since 0.1.0
     * @param {String} str Room id, name or groupRF
     * @returns {Room|null}
     */
    this.getRoom = function(str) {
        return _.find(rooms, function(room) {
            return room.id === str || room.name === str || room.groupRF === str;
        }) || null;
    };


    /**
     * Get Connection
     *
     * @since 0.1.0
     * @returns {Connection}
     */
    this.connection = function() {
        return connection;
    };


    /**
     * Close connection
     *
     * @since 0.1.0
     * @returns {Cube}
     */
    this.close = function() {
        connection.close();
        return this;
    };


    // listen for "H" event
    connection.once('data:H', function(e) {
        var helloData = e.text.split(','),
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

        data.set({
            serial: helloData[0],
            rf: helloData[1].toUpperCase(),
            firmware: parseInt(helloData[2], 10).toString().split('').join('.'),
            httpConnectionId: helloData[4],
            dutyCycle: parseInt(helloData[5], 16),
            freeMemory: parseInt(helloData[6], 16),
            timeOffset: Math.round((time.getTime() - now.getTime()) / 60000)
        });
    });

    // listen for "M" event
    connection.on('data:M', function(e) {
        var Room = require('./room.js'),
            Device = require('./device.js'),
            content = e.text.split(','),
            pointer = 3,
            roomLength,
            deviceLength,

            i, l,
            id;

        buffer.m = buffer.m || '';
        buffer.m += content[2];

        if(parseInt(content[0], 10) + 1 < content[1]) {
            return;
        }

        content = new Buffer(buffer.m, 'base64');
        roomLength = content.readUInt8(2);

        for(i = 0; i < roomLength; i += 1) {
            id = content.readUInt8(pointer);
            l = content.readUInt8(pointer + 1); // length of name
            pointer += 2;

            if(!rooms[id]) {
                rooms[id] = new Room({
                    cube: c,
                    connection: connection,
                    values: {
                        id: id,
                        name: content.toString('utf8', pointer, pointer + l),
                        groupRF: content.toString('hex', pointer + l, pointer + l + 3).toUpperCase()
                    }
                });
                c.emit('room', rooms[id]);
            }
            pointer += l + 3;
        }

        deviceLength = content.readUInt8(pointer);
        pointer += 1;

        for(i = 0; i < deviceLength; i += 1) {
            l = {}; // device data
            
            /*
             * Cube = 0,
             * RadiatorThermostat = 1,
             * RadiatorThermostatPlus = 2,
             * WallThermostat = 3,
             * ShutterContact = 4,
             * EcoButton = 5
             */
            l.type = content.readUInt8(pointer);
            pointer += 1;

            l.rf = content.toString('hex', pointer, pointer + 3).toUpperCase();
            pointer += 3;

            l.serial = content.toString('hex', pointer, pointer + 10).toUpperCase();
            id = l.serial;
            pointer += 10;

            l.nameLength = content.readUInt8(pointer);
            pointer += 1;

            l.name = content.toString('utf8', pointer, pointer + l.nameLength);
            pointer += l.nameLength;

            l.roomId = content.readUInt8(pointer) || null;
            pointer += 1;

            if(!devices[id]) {
                devices[id] = new Device({
                    cube: c,
                    connection: connection,
                    values: l
                });

                // I'm soo sorry…
                (function(device) {
                    device.once('sync', function() {
                        c.emit('device', device);
                    });
                    //data.waitFor(device);
                })(devices[id]);
            }
        }
    });


    if(config.autoConnect === undefined || config.autoConnect !== false) {
        connection.connect();
    }
};

util.inherits(Cube, EventEmitter);
module.exports = Cube;
