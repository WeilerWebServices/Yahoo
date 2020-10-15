// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var ReportManager = require('../');
var fs = require('fs');

(function () {
	var data, filteredOutput, manager;

	console.log("\n\n\nPreceptor Listener\n\n");

	manager = new ReportManager();
	manager.addListener('Preceptor');

	manager.addReporter('Spec');
	manager.addReporter('Json', {output: true});

	data = fs.readFileSync(__dirname + '/preceptor-listener.txt');

	manager.message().start();

	filteredOutput = manager.parse(data.toString());

	manager.message().stop();
	manager.message().complete();

	process.stdout.write("Filtered: " + filteredOutput + "\n");
}());

(function () {
	var data, filteredOutput, manager;

	console.log("\n\n\nTeamCity Listener\n\n");

	manager = new ReportManager();
	manager.addListener('TeamCity');

	manager.addReporter('Spec');
	manager.addReporter('Json', {output: true});

	data = fs.readFileSync(__dirname + '/teamcity-listener.txt');

	manager.message().start();

	filteredOutput = manager.parse(data.toString());

	manager.message().stop();
	manager.message().complete();

	process.stdout.write("Filtered: " + filteredOutput + "\n");
}());
