// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

var helper = require('../helper');

/**
 * Creates an event listener
 *
 * @method createEventListener
 * @return {object}
 */
function createEventListener (instance) {
	var results = {},
		oldEmit = instance.emit;

	instance.emit = function (message) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		results[message] = args;
		oldEmit.apply(instance, arguments);
	};
	return results;
}

describe('Event', function () {

	beforeEach(function () {
		this.Class = this.manager.getReporter('Event');
		this.container = helper.createContainerStub();

		this.sandbox = sinon.sandbox.create();

		this.instance = new this.Class(this.container);
		this.receivedMessages = createEventListener(this.instance);
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	it('should initialize message event', function () {

		this.instance.emit("message", "admin", "start", [1, 2]);

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["admin", "start", [1, 2]]);

		expect(this.receivedMessages).to.contain.key("admin");
		expect(this.receivedMessages.admin).to.be.deep.equal(["start", [1, 2]]);

		expect(this.receivedMessages).to.contain.key("start");
		expect(this.receivedMessages.start).to.be.deep.equal([[1, 2]]);
	});


	it('should trigger start', function () {
		this.instance.start();

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["admin", "start"]);
	});

	it('should trigger stop', function () {
		this.instance.stop();

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["admin", "stop"]);
	});

	it('should trigger complete', function () {
		this.instance.complete();

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["admin", "complete"]);
	});


	it('should trigger itemData', function () {
		this.instance.itemData("23", "{}");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["item", "itemData", ["23", "{}"]]);
	});

	it('should trigger itemMessage', function () {
		this.instance.itemMessage("24", "msg");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["item", "itemMessage", ["24", "msg"]]);
	});


	it('should trigger suiteStart', function () {
		this.instance.suiteStart("23", "22", "suite-name");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["suite", "suiteStart", ["23", "22", "suite-name"]]);
	});

	it('should trigger suiteEnd', function () {
		this.instance.suiteEnd("24");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["suite", "suiteEnd", ["24"]]);
	});


	it('should trigger testStart', function () {
		this.instance.testStart("23", "21", "test-name");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testStart", ["23", "21", "test-name"]]);
	});

	it('should trigger testFailed', function () {
		this.instance.testFailed("24", "msg", "reason");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testFailed", ["24", "msg", "reason"]]);
	});

	it('should trigger testError', function () {
		this.instance.testError("25", "msg", "reason");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testError", ["25", "msg", "reason"]]);
	});

	it('should trigger testPassed', function () {
		this.instance.testPassed("26");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testPassed", ["26"]]);
	});

	it('should trigger testUndefined', function () {
		this.instance.testUndefined("27");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testUndefined", ["27"]]);
	});

	it('should trigger testSkipped', function () {
		this.instance.testSkipped("28", "reason-msg");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testSkipped", ["28", "reason-msg"]]);
	});

	it('should trigger testIncomplete', function () {
		this.instance.testIncomplete("29");

		expect(this.receivedMessages).to.contain.key("message");
		expect(this.receivedMessages.message).to.be.deep.equal(["test", "testIncomplete", ["29"]]);
	});
});
