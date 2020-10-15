// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('TAP', function () {

	beforeEach(function () {
		this.manager.addReporter('Tap', {output: true, path: __dirname + '/tap.txt'});
	});

	it('should output', function () {
		process.stdout.write("TAP:\n");
		this.runTestSequence(this.manager);
	});
});
