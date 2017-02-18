module.exports = {
	swap: function(ary, indexA, indexB) {
		var temp = ary[indexA];
		ary[indexA] = ary[indexB];
		ary[indexB] = temp;
	}
};