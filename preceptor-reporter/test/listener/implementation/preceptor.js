// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');

describe('Preceptor', function () {

	beforeEach(function () {
		this.manager.addListener('Preceptor');

		this.manager.addReporter('Spec');
		this.manager.addReporter('Json', {output: true});

		this.manager.message().start();
	});

	it('should output', function () {
		process.stdout.write("Preceptor Listener with JSON output:\n");

		var data = fs.readFileSync(__dirname + '/../../resources/input/preceptor-listener.txt'),
			resultOutput = this.manager.parse(data.toString());

		this.manager.message().stop();
		this.manager.message().complete();

		process.stdout.write("Result: " + resultOutput + "\n");
	});
});
