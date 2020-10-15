// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var ReportManager = require('../../');

var manager = new ReportManager();

manager.addReporter('spec');
manager.addReporter('json', {output: true});

manager.message().start();

var hook = manager.loadHook('cucumber', undefined, function () {
	manager.message().stop();
	manager.message().complete();
});

module.exports = hook;
