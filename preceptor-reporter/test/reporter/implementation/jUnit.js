// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('JUnit', function () {

	beforeEach(function () {
		this.manager.addReporter('Junit', {output: true, path: __dirname + '/junit.xml'});
	});

	it('should output', function () {
		process.stdout.write("JUnit:\n");
		this.runTestSequence(this.manager);
	});
});
