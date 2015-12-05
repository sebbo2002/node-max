# node-max

[![License](https://img.shields.io/badge/license-GPL%203.0-blue.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/npm/v/@maexle/node-max.svg?style=flat-square)](LICENSE)

node-max is a node.js module to communicate with a [eQ3 MAX! Cube](http://www.eq-3.de/max-heizungssteuerung.html).


## Installation

	npm install @maexle/node-max


## Quick Start

```javascript
var max = require('@maexle/node-max'),
    discover = max.discover();

discover.once('cube', function(c) {
    var cube = c.connect();
    discover.end();

    cube.on('change', function() {
        console.log('\nCube:');
        console.log(cube.toJSON());
    });

    cube.on('room', function(room) {
        console.log('\nRoom: %s', room.name);
        console.log(room.toJSON());
    });

    cube.on('device', function(device) {
        console.log('\nDevice: %s%s', device.name, device.getRoom() ? ' in room ' + device.getRoom().name : '');
        console.log(device.toJSON());
        console.log(device.getConfig().toJSON());
        console.log(device.getStatus().toJSON());
    });

    cube.once('sync', function() {
        cube.close();
    });
});
```




## API

### node-max

#### max.connect([_String|Object_ options])

Connect with a cube knowing it's ip address.

```javascript
var max = require('@maexle/node-max'),
    cube = max.connect('192.168.0.10');
```

You can also pass an object instead:

```javascript
var max = require('@maexle/node-max'),
    cube = max.connect({ip: '192.168.0.10'});
```

#### max.discover()

Discover MAX! cubes in your local network. Returns an EventEmitter which fires these events:

- error: Something went wrong. You should get the error as the first argument.
- cube: Heey, we found a cube. Answer object described below.
- end: Discovery closed

The first argument for an `cube` event looks like this:

```json
{
    "ip": "192.168.0.10",
    "serial": "JEQ0123456",
    "rf": "012EF0",
    "version": "1.1.3",
    "connect": function() {…}
}
```

Use connect() to get the Cube Instance.



## Tests

There are just very few tests, you can run them with

```
npm test
```


## Copyright and license

Copyright (c) Sebastian Pekarek under the [GNU GPL 3.0](LICENSE).
