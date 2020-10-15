// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

require('../../helper');

var ReportManager = require('../../../');

describe('Implementation', function () {

	beforeEach(function () {
		this.manager = new ReportManager();
	});

	require('./dot');
	require('./duration');
	require('./event');
	require('./jenkinsSauceLabs');
	require('./json');
	require('./jUnit');
	require('./lineSummary');
	require('./list');
	require('./plain');
	require('./preceptor');
	require('./spec');
	require('./summary');
	require('./tap');
	require('./teamCity');

	require('./combination');
});
