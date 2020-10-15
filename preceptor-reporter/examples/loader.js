// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var ReportManager = require('../');
var Promise = require('Promise');

var loaders = ReportManager.getLoaders();

Promise.resolve().then(function () {
	// JUnit Loader

	var Class, instance;

	console.log("\n\n\nJUnit Loader\n\n");

	Class = loaders.junit;

	instance = new Class({
		path: __dirname + "/*.xml"
	});

	instance.on('message', function (areaType, messageType, params) {
		console.log(areaType, messageType, params);
	});

	return instance.process('33');

}).then(function () {
	// TAP Loader

	var Class, instance;

	console.log("\n\n\nTAP Loader\n\n");

	Class = loaders.tap;

	instance = new Class({
		path: __dirname + "/tap.txt"
	});

	instance.on('message', function (areaType, messageType, params) {
		console.log(areaType, messageType, params);
	});

	return instance.process('23');

}).then(function () {
	process.exit(0);
}, function (err) {
	console.err(err.stack);
});
