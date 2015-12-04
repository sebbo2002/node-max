'use strict';

/**
 * @author Sebastian Pekarek
 * @constructor BitsHelper
 */
module.exports = function(buffer, index) {
	var octet = buffer[index || 0],
		bits = [],
		bit,
		i;

    /*jslint bitwise: true */
	for(i = 7; i >= 0; i -= 1) {
		bit = octet & (1 << i) ? 1 : 0;
		bits.push(bit);
	}

	this.splice = function(min, max) {
        var result = '';

        bits.forEach(function(value, i) {
            if((i >= min || !min) && (i <= max || !max)) {
                result += value;
            }
        });

        return result;
    };
};