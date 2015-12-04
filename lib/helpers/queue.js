'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Request = require('./request.js'),
    Queue;

/**
 * @author Sebastian Pekarek
 * @constructor Queue
 */
Queue = function() {
    var q = this,

        /** @var Request[] **/
        items = [],

        isClosed = false;


    /**
     * @since 0.1.0
     * @returns {boolean}
     */
    this.empty = function() {
        return items.length === 0;
    };


    /**
     * @since 0.1.0
     * @returns {number}
     */
    this.length = function() {
        return items.length;
    };


    /**
     * @since 0.1.0
     * @returns {Request}
     */
    this.current = function() {
        if(items.length === 0) {
            return null;
        }

        return items[0];
    };


    /**
     * @since 0.1.0
     * @param {Request} request Request
     * @returns {Queue}
     */
    this.push = function(request) {
        if(isClosed) {
            throw new Error('Queue already closed.');
        }
        if(!(request instanceof Request)) {
            throw new Error('request has to be a Request instance.');
        }

        items.push(request);
        q.emit('push', request);

        return this;
    };


    /**
     * @since 0.1.0
     * @returns {Queue}
     */
    this.next = function() {
        items.shift();
        return this;
    };


    /**
     * @since 0.1.0
     * @returns {Queue}
     */
    this.close = function() {
        var req = new Request();
        req.type('q');
        req.oneWay(true);
        q.push(req);
        isClosed = true;

        return this;
    };
};

util.inherits(Queue, EventEmitter);
module.exports = Queue;
