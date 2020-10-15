// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Combination of Reporters', function () {

	beforeEach(function () {
		this.manager.addReporter('Dot');
		this.manager.addReporter('Spec', {progress: false});
		this.manager.addReporter('List');
		this.manager.addReporter('Summary', {color: false});
		this.manager.addReporter('Duration');
		this.manager.addReporter('LineSummary');
	});

	it('should output', function () {
		process.stdout.write("Mix of multiple Reporter:\n");
		this.runTestSequence(this.manager);
	});
});
