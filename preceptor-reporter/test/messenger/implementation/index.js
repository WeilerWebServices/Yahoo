// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

require('../../helper');

var ReportManager = require('../../../');
var sinon = require('sinon');

describe('Implementation', function () {

	beforeEach(function () {
		this.messengers = ReportManager.getMessengers();
		this.eventList = [];
		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	require('./jenkinsSauceLabs');
	require('./preceptor');
	require('./teamCity');
});
