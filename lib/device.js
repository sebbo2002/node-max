'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Device;

/**
 * @author Sebastian Pekarek
 * @constructor Device
 */
Device = function(o) {
    var Data = require('./helpers/data.js'),
        DeviceConfig = require('./device-config.js'),
        DeviceStatus = require('./device-status.js'),
        d = this,
        data = new Data(),
        config = new DeviceConfig({
            cube: o.cube,
            device: d,
            connection: o.connection
        }),
        status = new DeviceStatus({
            cube: o.cube,
            device: d,
            connection: o.connection
        }),
        cube = o.cube;

    data.setParent(this);
    data.setAttributes(['serial', 'rf', 'type', 'name', 'roomId', 'version']);
    data.waitFor([config]);
    data.initialize();
    setTimeout(function() {
        data.set(o.values);
    }, 0);


    /**
     * Get device config
     *
     * @since 0.1.0
     * @returns {DeviceConfig}
     */
    this.getConfig = function() {
        return config;
    };


    /**
     * Get device status
     *
     * @since 0.1.0
     * @returns {DeviceStatus}
     */
    this.getStatus = function() {
        return status;
    };


    /**
     * Get room
     *
     * @since 0.1.0
     * @returns {Room}
     */
    this.getRoom = function() {
        return cube.getRoom(this.roomId);
    };


    /**
     * Refresh Configuration
     *
     * @since 0.1.0
     * @returns {Room}
     */
    this.refresh = function() {
        config.refresh();
    };
};

util.inherits(Device, EventEmitter);
module.exports = Device;
