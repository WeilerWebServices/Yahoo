// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.
var expect = require('chai').expect;
var sinon = require('sinon');

var ReportManager = require('../../');

describe('Abstract', function () {

	beforeEach(function () {
		this.Class = ReportManager.AbstractMessenger;
		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	it('should have default values', function () {
		var instance = new this.Class();
		expect(instance.getOptions()).to.be.deep.equal({
			"configuration": {},
			"output": false
		});
	});

	it('should use supplied options', function () {
		var instance = new this.Class({
			"output": true,
			"test": 23
		});
		expect(instance.getOptions()).to.be.deep.equal({
			"configuration": {},
			"output": true,
			"test": 23
		});
	});

	it('should call "initialize()"', function () {
		var spy;

		spy = this.sandbox.spy(this.Class.prototype, 'initialize');
		new this.Class();

		expect(spy).to.have.been.calledOnce;
	});

	describe('shouldOutput()', function () {

		beforeEach(function () {
			this.instance = new this.Class();
		});

		it('should have default value', function () {
			var instance = new this.Class();
			expect(instance.shouldOutput()).to.be.false;
		});

		it('should use supplied option', function () {
			var instance = new this.Class({
				"output": true
			});
			expect(instance.shouldOutput()).to.be.true;
		});

		it('should convert supplied option', function () {
			var instance = new this.Class({
				"output": 23 // -> true
			});
			expect(instance.shouldOutput()).to.be.true;
		});
	});

	describe('trigger()', function () {

		beforeEach(function () {
			this.instance = new this.Class();
			this.outputStub = this.sandbox.stub(this.instance, 'output');
		});

		it('should trigger an event without options', function (done) {

			this.instance.on('message', function (msg, options) {
				expect(msg).to.be.equal('test-123');
				expect(options).to.be.deep.equal({});
				done();
			});

			this.instance.trigger('test-123');
		});

		it('should trigger an event with options', function (done) {

			this.instance.on('message', function (msg, options) {
				expect(msg).to.be.equal('test-123');
				expect(options).to.be.deep.equal({ test:11 });
				done();
			});

			this.instance.trigger('test-123', { test:11 });
		});

		it('should not output event', function () {
			this.instance.trigger('test-123');
			expect(this.outputStub).to.have.not.been.called;
		});

		it('should not output event', function () {
			this.sandbox.stub(this.instance, 'shouldOutput').returns(true);

			this.instance.trigger('test-123');

			expect(this.outputStub).to.have.been.called;
			expect(this.outputStub).to.have.been.calledWith('test-123');
		});
	});

	describe('output()', function () {

		it('should write to stdout', function () {

			this.stub = this.sandbox.stub(process.stdout, 'write');

			var instance = new this.Class();
			instance.output('test-23');

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith('test-23');
		});
	});
});
