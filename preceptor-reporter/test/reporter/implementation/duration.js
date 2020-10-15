// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

var helper = require('../helper');

describe('Duration', function () {

	beforeEach(function () {
		this.Class = this.manager.getReporter('Duration');
		this.container = helper.createContainerStub();

		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	it('should have default values', function () {
		var instance = new this.Class(this.container, {
			progress: undefined,
			output: undefined
		});

		expect(instance.shouldShowProgress()).to.be.false;
		expect(instance.shouldOutput()).to.be.true;
	});

	describe('stop()', function () {

		beforeEach(function () {
			this.instance = new this.Class(this.container);
			this.treeStub = this.sandbox.stub(this.container, 'getTree');
			this.consoleStub = this.sandbox.stub(this.instance, 'console');
		});

		it('should call getTree() on container', function () {
			this.treeStub.returns({ "duration": 1 });

			this.instance.stop();

			expect(this.treeStub).to.have.been.calledOnce;
		});

		it('should call console()', function () {
			this.treeStub.returns({ "duration": 1 });

			this.instance.stop();

			expect(this.consoleStub).to.have.been.calledOnce;
		});

		it('should output in milliseconds', function () {
			this.treeStub.returns({ "duration": 1000 });

			this.instance.stop();

			expect(this.consoleStub).to.have.been.calledWith(
				undefined,
				"stop",
				"Time: 1000 milliseconds\n\n"
			);
		});

		it('should output in seconds - lower bound', function () {
			this.treeStub.returns({ "duration": 1001 }); // 1 second (1 ms)

			this.instance.stop();

			expect(this.consoleStub).to.have.been.calledWith(
				undefined,
				"stop",
				"Time: 1.001 seconds\n\n"
			);
		});

		it('should output in seconds - upper bound', function () {
			this.treeStub.returns({ "duration": 119999 }); // 2 minutes (-1 ms)

			this.instance.stop();

			expect(this.consoleStub).to.have.been.calledWith(
				undefined,
				"stop",
				"Time: 119.999 seconds\n\n"
			);
		});

		it('should output in minutes - lower bound', function () {
			this.treeStub.returns({ "duration": 120000 }); // 2 minutes

			this.instance.stop();

			expect(this.consoleStub).to.have.been.calledWith(
				undefined,
				"stop",
				"Time: 2 minutes\n\n"
			);
		});
	});
});
