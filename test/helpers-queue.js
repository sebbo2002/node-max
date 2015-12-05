'use strict';

var assert = require('assert'),
	Request = require('../lib/helpers/request.js'),
    Queue = require('../lib/helpers/queue.js');

describe('helpers: queue', function() {
	describe('#empty()', function() {
        it('should work', function() {
			var queue = new Queue();
			assert.equal(queue.empty(), true, 'Queue is empty…');

            queue.push(new Request());
            assert.equal(queue.empty(), false, 'Queue is not empty…');
		});
	});

    describe('#length()', function() {
        it('should work', function() {
            var queue = new Queue();
            assert.equal(queue.length(), 0, 'Queue = 0');

            queue.push(new Request());
            assert.equal(queue.length(), 1, 'Queue = 1');

            queue.push(new Request());
            queue.push(new Request());
            assert.equal(queue.length(), 3, 'Queue = 3');
        });
    });

    describe('#current()', function() {
        it('should return null if empty', function() {
            var queue = new Queue();
            assert.equal(queue.current(), null);
        });
        it('should return first item when filled', function() {
            var queue = new Queue(),
                first = new Request(),
                second = new Request();

            queue.push(first);
            assert.deepEqual(queue.current(), first);

            queue.push(second);
            assert.deepEqual(queue.current(), first);
            assert.notDeepEqual(queue.current(), second);
        });
    });

    describe('#push()', function() {
        it('should return this', function() {
            var queue = new Queue(),
                req = new Request();

            assert.deepEqual(queue.push(req), queue);
        });
        it('should trigger event', function(cb) {
            var queue = new Queue(),
                first = new Request();

            queue.once('push', function(req) {
                assert.strictEqual(req, first, 'event request is okay…');
                cb();
            });

            queue.push(first);
        });
        it('should block if closed', function() {
            var queue = new Queue(),
                req = new Request();

            queue.push(req);
            queue.close();

            assert.throws(function() {
                queue.push(req);
            }, /already closed/);
        });
        it('should allow request instances only', function() {
            var queue = new Queue();

            assert.throws(function() {
                queue.push(3);
            }, /instance/);
        });
    });

    describe('#next()', function() {
        it('should return this', function() {
            var queue = new Queue();
            assert.deepEqual(queue.next(), queue);
        });
        it('should work', function() {
            var queue = new Queue(),
                first = new Request(),
                second = new Request();

            assert.equal(queue.length(), 0, 'initial length = 0');

            queue.push(first);
            assert.equal(queue.length(), 1, 'length = 1');
            assert.deepEqual(queue.current(), first, 'current = first');

            queue.push(second);
            assert.equal(queue.length(), 2, 'length = 2');
            assert.deepEqual(queue.current(), first, 'current = first');

            queue.next();
            assert.equal(queue.length(), 1, 'length = 1');
            assert.deepEqual(queue.current(), second, 'current = second');

            queue.next();
            assert.equal(queue.length(), 0, 'length = 0');
            assert.deepEqual(queue.current(), null, 'current = null');

            queue.next();
            assert.equal(queue.length(), 0, 'length = 0');
            assert.deepEqual(queue.current(), null, 'current = null');
        });
    });

    describe('#close()', function() {
        it('should return this', function() {
            var queue = new Queue();
            assert.deepEqual(queue.close(), queue);
        });
        it('should add q request', function() {
            var queue = new Queue();

            queue.close();
            assert.equal(queue.current().type(), 'q');
        });
    });
});