module.exports = function(buffer, index) {
	'use strict';

	var octet = buffer[index || 0],
		bits = [],
		bit,
		i;

	for(i = 7; i >= 0; i--) {
		bit = octet & (1 << i) ? 1 : 0;
		bits.push(bit);
	}

	return {

		splice: function BitsHelperSplice(min, max) {
			var result = '';

			bits.forEach(function(value, i) {
				if((i >= min || !min) && (i <= max || !max)) {
					result += value;
				}
			});

			return result;
		}
	};
};