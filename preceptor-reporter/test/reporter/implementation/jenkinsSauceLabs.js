// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Jenkins SauceLabs', function () {

	beforeEach(function () {
		this.manager.addReporter('JenkinsSauceLabs', {configuration: {sessionId: "23", jobName: "24"}});
	});

	it('should output', function () {
		process.stdout.write("Jenkins Sauce-Labs:\n");
		this.runTestSequence(this.manager);
	});
});
