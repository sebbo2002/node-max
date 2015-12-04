'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Data;

/**
 * @author Sebastian Pekarek
 * @constructor Data
 */
Data = function() {
    var d = this,
        keys = [],
        attributes = {},
        waitFor = {todo: 1, done: 0},
        parent;


    /**
     * @since 0.1.0
     * @param {Object} _parent
     * @returns {Data}
     */
    this.setParent = function(_parent) {
        parent = _parent;
        return d;
    };


    /**
     * @since 0.1.0
     * @param {Array} _attributes
     * @returns {Data}
     */
    this.setAttributes = function(_attributes) {
        _attributes.forEach(function(attribute) {
            var theNew = {
                name: null,
                writeable: false,
                value: null
            };

            if(typeof attribute === 'string') {
                theNew.name = attribute;
            }
            else if(typeof attribute === 'object' && attribute.name) {
                theNew.name = attribute.name;
            }

            keys.push(theNew.name);
            attributes[theNew.name] = theNew;
        });

        return d;
    };


    /**
     * @since 0.1.0
     * @returns {Data}
     */
    this.initialize = function() {
        // generate public get
        parent.get = function(attribute) {
            if(!attributes[attribute]) {
                throw new Error('Unknown attribute `' + attribute + '`');
            }

            return attributes[attribute].value;
        };

        // @todo generate public set

        // generate public getter/setter
        keys.forEach(function(attribute) {
            Object.defineProperty(parent, attribute, {
                get: function () {
                    return parent.get(attribute);
                }
            });
        });


        // generate public toJSON()
        parent.toJSON = function() {
            var result = {};

            keys.forEach(function(attribute) {
                result[attribute] = parent.get(attribute);
            });

            return result;
        };
        return this;
    };


    /**
     * @since 0.1.0
     * @param {Object} values
     */
    this.set = function(values) {
        var changed = false,
            key;

        for(key in values) {
            if(values.hasOwnProperty(key) && attributes[key] && values[key] !== attributes[key].value) {
                changed = true;
                attributes[key].value = values[key];
                parent.emit('change:' + key, parent.get(key));
            }
        }

        if(changed) {
            parent.emit('change');
        }
        if(!d.set.sync) {
            d.set.sync = true;
            waitFor.done += 1;
            d.waitFor();
        }
    };


    /**
     * @since 0.1.0
     * @param {exports[]} [objects]
     */
    this.waitFor = function(objects) {
        if(objects) {
            objects = Array.isArray(objects) ? objects : [objects];
            objects.forEach(function(object) {
                waitFor.todo += 1;
                object.once('sync', function() {
                    waitFor.done += 1;
                    d.waitFor();
                });
            });
        }

        if(!d.waitFor.synced && waitFor.done >= waitFor.todo) {
            parent.emit('sync');
            d.waitFor.synced = true;
        }
    };
};

util.inherits(Data, EventEmitter);
module.exports = Data;
