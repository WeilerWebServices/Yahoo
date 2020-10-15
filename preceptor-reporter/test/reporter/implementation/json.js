// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('JSON', function () {

	beforeEach(function () {
		this.manager.addReporter('Json', {output: true, path: __dirname + '/data.json'});
	});

	it('should output', function () {
		process.stdout.write("JSON:\n");
		this.runTestSequence(this.manager);
	});
});
