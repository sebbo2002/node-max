'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Room;

/**
 * @author Sebastian Pekarek
 * @constructor Room
 */
Room = function(o) {
    var Data = require('./helpers/data.js'),
        data = new Data();

    data.setParent(this);
    data.setAttributes(['id', 'name', 'groupRF']);
    data.initialize();
    data.set(o.values);


};

util.inherits(Room, EventEmitter);
module.exports = Room;
