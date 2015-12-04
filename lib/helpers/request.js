'use strict';

/**
 * @author Sebastian Pekarek
 * @constructor Request
 */
var Request = function() {
    var data = {};


    /**
     * @since 0.1.0
     * @param {String} [type] Request Type
     * @returns {String|Request}
     */
    this.type = function(type) {
        if(type) {
            data.type = type;
            return this;
        }

        return data.type;
    };


    /**
     * @since 0.1.0
     * @param {String} [body] Request Body
     * @returns {String|Request}
     */
    this.body = function(body) {
        if(body) {
            data.body = body;
            return this;
        }

        return data.body;
    };


    /**
     * @since 0.1.0
     * @param {String} [responseType] Request Response Type
     * @returns {String|Request}
     */
    this.responseType = function(responseType) {
        if(responseType) {
            data.responseType = responseType;
            return this;
        }

        return data.responseType;
    };


    /**
     * @since 0.1.0
     * @param {Function} [responseFilter] request response filter
     * @returns {Function|Request}
     */
    this.responseFilter = function(responseFilter) {
        if(responseFilter) {
            data.responseFilter = responseFilter;
            return this;
        }

        return data.responseFilter;
    };


    /**
     * @since 0.1.0
     * @param {Function} [callback] Request Callback
     * @returns {Function|Request}
     */
    this.callback = function(callback) {
        if(callback) {
            data.callback = callback;
            return this;
        }

        return data.callback;
    };


    /**
     * @since 0.1.0
     * @param {Boolean} [oneWay] OneWay
     * @returns {Boolean|Request}
     */
    this.oneWay = function(oneWay) {
        if(oneWay) {
            data.oneWay = oneWay;
            return this;
        }

        return data.oneWay;
    };


    /**
     * @since 0.1.0
     * @param {Object} [event] module:connection data event
     * @returns {boolean}
     */
    this.checkResponse = function(event) {
        var filter = this.responseFilter();

        return (
            (!this.responseType() || event.type !== this.responseType) &&
            (!filter || filter(event))
        );
    };


    /**
     * @since 0.1.0
     * @returns {String}
     */
    this.send = function() {
        if(!this.type()) {
            throw new Error('`type` required!');
        }
        if(!this.oneWay() && !this.responseType() && !this.responseFilter()) {
            throw new Error('Either `response.type` or `response.filter` required!');
        }

        return this.type() + ':' + this.body() + '\r\n';
    };
};

module.exports = Request;
