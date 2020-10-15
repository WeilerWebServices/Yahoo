// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Plain', function () {

	beforeEach(function () {
		this.manager.addReporter('Plain', {path: __dirname + '/plain.txt'});
	});

	it('should output', function () {
		process.stdout.write("Plain:\n");
		this.runTestSequence(this.manager);
	});
});
