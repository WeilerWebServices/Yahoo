// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Summary', function () {

	beforeEach(function () {
		this.manager.addReporter('Summary');
	});

	it('should output', function () {
		process.stdout.write("Summary:\n");
		this.runTestSequence(this.manager);
	});
});
