// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Jenkins SauceLabs', function () {

	beforeEach(function () {
		var Class = this.messengers.jenkinssaucelabs;
		this.instance = new Class();
		this.stub = this.sandbox.stub(this.instance, "trigger");
	});

	it('should trigger a build', function () {
		this.instance.sendBuildInfo('session-1234', 'job-5678', { test:12 });

		expect(this.stub).to.have.been.calledOnce;
		expect(this.stub).to.have.been.calledWith("SauceOnDemandSessionID=session-1234 job-name=job-5678\n", { test:12 });
	});
});
