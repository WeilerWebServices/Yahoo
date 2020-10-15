// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

describe('test suite', function () {
	it('should just work', function () {

	});

	describe('sub tests', function () {
		it('should also be successful', function () {

		});
	});

	it('should be incomplete');

	it.skip('should be skipped', function () {

	});

	var tst = it('should be incomplete using the pending property', function () {

	});
	tst.pending = true;

	it('should fail', function () {
		throw new Error('An error happened here.');
	});
});

describe('another test suite', function () {
	it('should also be successful in second suite', function () {

	});
});
