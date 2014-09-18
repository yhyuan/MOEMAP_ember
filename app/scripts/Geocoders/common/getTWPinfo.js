var replaceChar = require('./replaceChar');

/**
 * Parse the input to get the Geographic Township, Lot, and Concession. 
 *
 * @param {Array} The array to be parsed.
 * @return {object} An ojbect which contain TWP, Lot, Con, isTWPOnly, success.
 */
var processLotCon = function (arr1) {
	if (arr1.length !== 2) {
		return {
			TWP: '',
			Lot: '',
			Con: '',
			isTWPOnly: false,
			success: false
		};
	}
	var TWPname = (arr1[0]).trim().split(/\s+/).join(' '); //replace multiple spaces with one space
	var con = '';
	var lot = '';
	if (((arr1[1]).indexOf('LOT') > 0) && ((arr1[1]).indexOf('CON') > 0)) {
		var arr2 = ((arr1[1]).trim()).split('CON');
		if ((arr2[0]).length === 0) {
			var arr3 = (arr2[1]).split('LOT');
			con = (arr3[0]).trim();
			lot = (arr3[1]).trim();
		} else {
			var arr4 = (arr2[0]).split('LOT');
			con = (arr2[1]).trim();
			lot = (arr4[1]).trim();
		}
	}
	var TWPOnly = false;
	if ((con.length === 0) && (lot.length === 0)) {
		TWPOnly = true;
	}
	return {
		TWP: TWPname,
		Lot: lot,
		Con: con,
		isTWPOnly: TWPOnly,
		success: true
	};
};
/**
 * Process the input for Geographic Township with/without Lot & Concession. 
 *
 * @param {corrsUp} The input array.
 * @return {object} An ojbect which contain TWP, Lot, Con, isTWPOnly, success.
 **/
module.exports = function (address) {
	var corrsUp = replaceChar(address, ',', ' ').trim().split(/\s+/).join(' ').toUpperCase();
	var res = {
		TWP: '',
		Lot: '',
		Con: '',
		isTWPOnly: false,
		success: false
	};
	if (corrsUp.indexOf(' TWP') > 0) {
		res = processLotCon(corrsUp.split(' TWP'));
	}
	if (!res.success) {
		if (corrsUp.indexOf(' TOWNSHIP') > 0) {
			res = processLotCon(corrsUp.split(' TOWNSHIP'));
		}
	}
	if (!res.success) {
		if (corrsUp.indexOf('CANTON ') === 0) {
			var str = corrsUp.substring(7).trim();
			var lotIndex = str.indexOf(' LOT ');
			var conIndex = str.indexOf(' CON ');
			var index = lotIndex;
			if (conIndex < lotIndex) {
				index = conIndex;
			}
			var parsedList = [];
			if (index === -1) {
				parsedList.push(str);
				parsedList.push('');
			} else {
				parsedList.push(str.substring(0, index));
				parsedList.push(str.substring(index));
			}
			res = processLotCon(parsedList);
		}
	}
	return res;
};