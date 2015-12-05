'use strict';

var util = require('util'),
    net = require('net'),
    EventEmitter = require('events').EventEmitter,
    Queue = require('./queue.js'),
    Connection;

/**
 * @author Sebastian Pekarek
 * @constructor Connection
 */
Connection = function(config) {
    var c = this,

        /** @var {Queue} */
        queue = new Queue(),
        internals = {},

        shouldBeConnected = false,
        connecting = false,
        connected = false,
        reconnect = true,

        socket;


    internals.connect = function() {
        if(connecting || connected) {
            return;
        }

        connecting = true;
        c.emit('raw:connecting', c);

        socket = net.connect({
            port: 62910,
            host: config.ip
        }, function() {
            connecting = false;
            connected = true;
            c.emit('raw:connected', c);

            c.once('raw:data:L', function() {
                internals.sendRequest();
            });
        });

        socket.on('data', function(d) {
            d.toString('ascii').split('\r\n').forEach(function(l) {
                if(l.length === 0) {
                    return;
                }

                var text = l.substr(2, l.length),
                    type = l.substr(0, 1),
                    all = {type: type, text: text};

                //console.info('[connection] received %s: %s', type, text);

                c.emit('raw:data', all, c);
                c.emit('raw:data:' + type, all, c);

                c.emit('data', all, c);
                c.emit('data:' + type, all, c);
            });
        });

        socket.on('close', function() {
            connecting = false;
            connected = false;
            c.emit('raw:close', c);

            if(reconnect || queue.length()) {
                internals.checkConnection();
            }else{
                c.emit('bye');
            }
        });
    };


    internals.checkConnection = function() {
        if(shouldBeConnected && !connected && !connecting) {
            internals.connect();
        }
    };

    internals.sendRequest = function() {
        if(queue.empty()) {
            queue.once('push', internals.sendRequest);
            return;
        }

        var request = queue.current(),
            listenerEvent,
            listenerFunc;

        if(!request.oneWay()) {
            listenerFunc = function(event) {
                if(!request.checkResponse(event)) {
                    return;
                }

                c.removeListener(listenerEvent, listenerFunc);
                queue.next();
                internals.sendRequest();

                var cb = request.callback();
                if(cb) {
                    cb(event);
                }
            };

            if(request.responseType()) {
                listenerEvent = 'raw:data:' + request.responseType();
            } else {
                listenerEvent = 'raw:data';
            }

            c.on(listenerEvent, listenerFunc);
        }

        //console.info('[connection] send %s', request.send());
        socket.write(request.send());

        if(request.oneWay()) {
            queue.next();
            internals.sendRequest();
        }
    };


    /**
     * @since 0.1.0
     * @returns {Connection}
     */
    this.connect = function() {
        shouldBeConnected = true;
        internals.checkConnection();
        return this;
    };


    /**
     * @since 0.1.0
     * @param {Request} request Request
     * @returns {Connection}
     */
    this.send = function(request) {
        queue.push(request);
        return this;
    };


    /**
     * @since 0.1.0
     * @param {Function} [cb] Callback
     * @returns {Connection}
     */
    this.close = function(cb) {
        if(cb) {
            c.once('bye', function() {
                cb();
            });
        }

        c.emit('close');
        reconnect = false;
        queue.close();
        return this;
    };


    this.setMaxListeners(100);
};

util.inherits(Connection, EventEmitter);
module.exports = Connection;
