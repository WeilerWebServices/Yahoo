// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Preceptor', function () {

	beforeEach(function () {
		this.manager.addReporter('Preceptor');
	});

	it('should output', function () {
		process.stdout.write("Preceptor:\n");
		this.runTestSequence(this.manager);
	});
});
