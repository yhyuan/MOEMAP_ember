/**
 * Parse a string with the degree, minute, and second symbols and return a value in decimal format. 
 *
 * @param {val} The string to be parsed.
 * @param {s1} The degree symbol.
 * @param {s2} The minute symbol
 * @param {s3} The second symbol
 * @return {Number} The parsed decimal lat/lng.
 **/
var regIsFloat = /^(-?\d+)(\.\d+)?$/;
module.exports = function (val, s1, s2, s3) {
	var parseDMS = function (s, unparsed) {
		var res = {
			ParsedNum: 0,
			Unparsed: ''
		};
		if (unparsed.length === 0) {
			return res;
		}
		var arr = unparsed.split(s);
		var result = 0;
		if (arr.length <= 2) {
			if (regIsFloat.test(arr[0])) {
				result = parseFloat(arr[0]);
			}
			if (arr.length === 2) {
				unparsed = arr[1];
			} else {
				unparsed = '';
			}
		}
		res = {
			ParsedNum: result,
			Unparsed: unparsed
		};
		return res;
	};

	var result = 0;
	var parsed = parseDMS(s1, val);
	var deg = parsed.ParsedNum;
	parsed = parseDMS(s2, parsed.Unparsed);
	var min = parsed.ParsedNum;
	parsed = parseDMS(s3, parsed.Unparsed);
	var sec = parsed.ParsedNum;
	if (deg > 0) {
		result = deg + min / 60.0 + sec / 3600.0;
	} else {
		result = deg - min / 60.0 - sec / 3600.0;
	}
	result = Math.abs(result);
	return result;
};