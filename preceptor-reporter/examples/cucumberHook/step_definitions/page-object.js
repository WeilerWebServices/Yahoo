// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

module.exports = function () {

	this.Given(/^take a screenshot with error$/, function () {
		throw new Error('An error just happened for some reason');
	});

	this.Given(/^take a screenshot with id "([^"]*)"$/, function (id, done) {
		done.pending();
	});

	this.Given(/^I navigate to the "([^"]*)" page$/, function (page, done) {
		done();
	});

	this.Given(/^I am on the "([^"]*)" page$/, function (page, done) {
		done();
	});
};
