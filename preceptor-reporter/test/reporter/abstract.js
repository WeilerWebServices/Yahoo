// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

var ReportManager = require('../../');
var helper = require('./helper');

describe('Abstract', function () {

	beforeEach(function () {
		this.Class = ReportManager.AbstractReporter;
		this.container = helper.createContainerStub();

		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	it('should have default values', function () {
		var instance = new this.Class(this.container);
		expect(instance.getOptions()).to.be.deep.equal({
			"type": null,
			"path": null,
			"configuration": {},
			"color": true,
			"output": undefined,
			"progress": undefined
		});
	});

	it('should use supplied options', function () {
		var instance = new this.Class(this.container, {
			"type": 'test-type',
			"test": 23
		});
		expect(instance.getOptions()).to.be.deep.equal({
			"type": 'test-type',
			"path": null,
			"configuration": {},
			"color": true,
			"output": undefined,
			"progress": undefined,
			"test": 23
		});
	});

	it('should call "initialize()"', function () {
		var spy;

		spy = this.sandbox.spy(this.Class.prototype, 'initialize');
		new this.Class(this.container);

		expect(spy).to.have.been.calledOnce;
	});

	it('should have the container', function () {
		var instance = new this.Class(this.container);
		expect(instance.getContainer()).to.be.equal(this.container);
	});

	describe('Options', function () {

		beforeEach(function () {

			this.configuration = {
				"test-option": 'test-value'
			};

			this.instance = new this.Class(this.container, {
				"type": 'test-type',
				"path": 'test-path',
				"configuration": this.configuration,
				"color": 1, // See if it casts to true
				"output": 0, // See if it casts to false
				"progress": 1 // See if it casts to true
			});
		});

		it('should get the type', function () {
			expect(this.instance.getType()).to.be.equal('test-type');
		});

		it('should get the path', function () {
			expect(this.instance.getPath()).to.be.equal('test-path');
		});

		it('should get the configuration', function () {
			expect(this.instance.getConfiguration()).to.be.deep.equal(this.configuration);
		});

		it('should get the color property', function () {
			expect(this.instance.useColor()).to.be.true;
		});

		it('should get the output property', function () {
			expect(this.instance.shouldOutput()).to.be.false;
		});

		it('should get the progress property', function () {
			expect(this.instance.shouldShowProgress()).to.be.true;
		});
	});

	describe('output()', function () {

		it('should write to stdout', function () {

			this.stub = this.sandbox.stub(process.stdout, 'write');

			var instance = new this.Class(this.container);
			instance.output('test-23');

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith('test-23');
		});
	});

	describe('console()', function () {

		beforeEach(function () {
			this.actionStub = this.sandbox.stub(this.container, 'getAction');
		});

		it('should get the corresponding action', function () {
			var instance,
				id = '12',
				action = {
					"output": {
						"msg-type": {
							"report-type": []
						}
					}
				};

			this.actionStub.returns(action);

			instance = new this.Class(this.container, {
				type: 'report-type'
			});
			this.sandbox.stub(instance, 'output');

			instance.console(id, 'msg-type', 'test-message');

			expect(this.actionStub).to.have.been.calledOnce;
			expect(this.actionStub).to.have.been.calledWith(id);
		});

		it('should add a new message entry', function () {
			var instance,
				action = {
					"output": {
						"msg-type": {
							"report-type": ['first-msg'],
							"another": []
						}
					}
				};

			this.actionStub.returns(action);

			instance = new this.Class(this.container, {
				type: 'report-type'
			});
			this.sandbox.stub(instance, 'output');

			instance.console('12', 'msg-type', 'test-message');

			expect(action).to.have.deep.equal({
				"output": {
					"msg-type": {
						"report-type": ['first-msg', 'test-message'],
						"another": []
					}
				}
			});
		});

		it('should create a new report-type entry', function () {
			var instance,
				action = {
					"output": {
						"msg-type": {},
						"another": {}
					}
				};

			this.actionStub.returns(action);

			instance = new this.Class(this.container, {
				type: 'report-type'
			});
			this.sandbox.stub(instance, 'output');

			instance.console('12', 'msg-type', 'test-message');

			expect(action).to.have.deep.equal({
				"output": {
					"msg-type": {
						"report-type": ['test-message']
					},
					"another": {}
				}
			});
		});

		it('should create a new message-type entry', function () {
			var instance,
				action = {
					"output": {},
					"another": {}
				};

			this.actionStub.returns(action);

			instance = new this.Class(this.container, {
				type: 'report-type'
			});
			this.sandbox.stub(instance, 'output');

			instance.console('12', 'msg-type', 'test-message');

			expect(action).to.have.deep.equal({
				"output": {
					"msg-type": {
						"report-type": ['test-message']
					}
				},
				"another": {}
			});
		});

		describe('Output', function () {

			beforeEach(function () {
				this.action = {
					"output": {
						"msg-type": {
							"report-type": ['first-msg'],
							"another": []
						}
					}
				};
				this.actionStub.returns(this.action);
			});

			it('should not output', function () {

				var outputStub,
					instance;

				instance = new this.Class(this.container, {
					"type": 'report-type',
					"output": false,
					"progress": false
				});
				outputStub = this.sandbox.stub(instance, 'output');

				instance.console('12', 'msg-type', 'test-message');

				expect(outputStub).to.not.have.been.called;
			});

			it('should output when requested', function () {

				var outputStub,
					instance;

				instance = new this.Class(this.container, {
					"type": 'report-type',
					"output": true,
					"progress": false
				});
				outputStub = this.sandbox.stub(instance, 'output');

				instance.console('12', 'msg-type', 'test-message');

				expect(outputStub).to.not.have.been.called;
			});

			it('should output with progress', function () {

				var outputStub,
					instance;

				instance = new this.Class(this.container, {
					"type": 'report-type',
					"output": false,
					"progress": true
				});
				outputStub = this.sandbox.stub(instance, 'output');

				instance.console('12', 'msg-type', 'test-message');

				expect(outputStub).to.not.have.been.called;
			});

			it('should output when requested and progress', function () {

				var outputStub,
					instance,
					message = 'test-message';

				instance = new this.Class(this.container, {
					"type": 'report-type',
					"output": true,
					"progress": true
				});
				outputStub = this.sandbox.stub(instance, 'output');

				instance.console('12', 'msg-type', message);

				expect(outputStub).to.have.been.calledOnce;
				expect(outputStub).to.have.been.calledWith(message);
			});
		});
	});

	describe('toString()', function () {

		it('should get the output', function () {
			var result,
				stub,
				instance,
				expected = 'test-expect';

			instance = new this.Class(this.container);
			stub = this.sandbox.stub(instance, 'getOutput').returns(expected);

			result = instance.toString();

			expect(result).to.be.equal(expected);
			expect(stub).to.have.been.calledOnce;
		});
	});

	describe('write()', function () {

		it('should not write when no path is given', function () {
			var instance,
				writeStub;

			instance = new this.Class(this.container, { path: null });
			writeStub = this.sandbox.stub(instance, '_writeToFile');

			instance.write();

			expect(writeStub).to.not.have.been.called;
		});

		it('should not write when no path is given', function () {
			var instance,
				writeStub,
				path = '/tmp/somewhere',
				output = 'test-output';

			instance = new this.Class(this.container, { path: path });
			writeStub = this.sandbox.stub(instance, '_writeToFile');
			this.sandbox.stub(instance, 'getOutput').returns(output);

			instance.write();

			expect(writeStub).to.have.been.calledOnce;
			expect(writeStub).to.have.been.calledWith(path, output);
		});
	});

	describe('output', function () {

		beforeEach(function () {
			this.instance = new this.Class(this.container, {
				"type": 'test-type'
			});
		});

		describe('getOutput()', function () {

			beforeEach(function () {
				this.actionStub = this.sandbox.stub(this.container, 'getAction');
				this.actionIdsStub = this.sandbox.stub(this.instance, '_gatherNodesFromTree');
			});

			it('should gather nodes from tree', function () {
				this.actionIdsStub.returns([]);

				this.instance.getOutput();

				expect(this.actionIdsStub).to.have.been.calledOnce;
			});

			it('should have an empty result', function () {
				var result;

				this.actionIdsStub.returns([]);

				result = this.instance.getOutput();

				expect(result).to.be.equal('');
			});

			it('should get action', function () {

				this.actionIdsStub.returns([["1", "stop"]]);
				this.actionStub.returns({ "output": {} });

				this.instance.getOutput();

				expect(this.actionStub).to.have.been.calledOnce;
				expect(this.actionStub).to.have.been.calledWith("1");
			});

			it('should ignore unknown message types', function () {
				var result;

				this.actionIdsStub.returns([["1", "stop"]]);
				this.actionStub.returns({
					"output": {
						"start": { // Unknown
							"test-type": ['first-msg\n', 'second-msg\n']
						}
					}
				});

				result = this.instance.getOutput();

				expect(result).to.be.equal('');
			});

			it('should ignore unknown report types', function () {
				var result;

				this.actionStub.returns({
					"output": {
						"stop": {
							"unknown-type": ['first-msg\n', 'second-msg\n']
						}
					}
				});
				this.actionIdsStub.returns([["1", "stop"]]);

				result = this.instance.getOutput();

				expect(result).to.be.equal('');
			});

			it('should get output', function () {
				var result;

				this.actionStub.returns({
					"output": {
						"stop": {
							"test-type": ['first-msg\n', 'second-msg\n']
						}
					}
				});
				this.actionIdsStub.returns([["1", "stop"]]);

				result = this.instance.getOutput();

				expect(this.actionIdsStub).to.have.been.calledOnce;
				expect(result).to.be.equal('first-msg\nsecond-msg\n');
			});
		});

		describe('_gatherNodesFromTree()', function () {

			beforeEach(function () {
				this.treeStub = this.sandbox.stub(this.container, 'getTree');
			});

			it('should call getTree()', function () {

				this.treeStub.returns({
					"children": []
				});

				this.instance._gatherNodesFromTree();

				expect(this.treeStub).to.have.been.calledOnce;
			});

			it('should handle an empty report', function () {
				var result,
					expected;

				this.treeStub.returns({
					"children": []
				});

				expected = [
					[undefined, "start"],
					[undefined, "stop"],
					[undefined, "complete"]
				];

				result = this.instance._gatherNodesFromTree();

				expect(result).to.be.deep.equal(expected);
			});

			it('should handle a one-level deep report', function () {
				var result,
					expected;

				this.treeStub.returns({
					"children": [
						{
							"id": '23'
						},
						{
							"id": '44'
						}
					]
				});

				expected = [
					[undefined, "start"],

					["23", "start"],
					["23", "end"],

					["44", "start"],
					["44", "end"],

					[undefined, "stop"],
					[undefined, "complete"]
				];

				result = this.instance._gatherNodesFromTree();

				expect(result).to.be.deep.equal(expected);
			});

			it('should handle a multi-level report', function () {
				var result,
					expected;

				this.treeStub.returns({
					"children": [
						{
							"id": '23'
						},
						{
							"id": '44',
							"children": [
								{
									"id": '121'
								}
							]
						}
					]
				});

				expected = [
					[undefined, "start"],

					["23", "start"],
					["23", "end"],

					["44", "start"],

					["121", "start"],
					["121", "end"],

					["44", "end"],

					[undefined, "stop"],
					[undefined, "complete"]
				];

				result = this.instance._gatherNodesFromTree();

				expect(result).to.be.deep.equal(expected);
			});
		});
	});

	describe('lifecycle', function () {

		describe('start()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.start();
			});
		});

		describe('stop()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.stop();
			});
		});

		describe('complete()', function () {

			it('should write to file', function () {
				var instance = new this.Class(this.container),
					writeStub = this.sandbox.stub(instance, 'write');

				instance.complete();

				expect(writeStub).to.have.been.calledOnce;
			});

			it('should not try to output when not requested', function () {
				var instance = new this.Class(this.container, { output: false }),
					getOutputStub = this.sandbox.stub(instance, 'getOutput').returns(''),
					writeStub = this.sandbox.stub(instance, 'write'),
					outputStub = this.sandbox.stub(instance, 'output');

				instance.complete();

				expect(getOutputStub).to.have.not.been.called;
				expect(writeStub).to.have.been.calledOnce;
				expect(outputStub).to.have.not.been.called;
			});

			it('should not try to output with progress', function () {
				var instance = new this.Class(this.container, { progress: true }),
					getOutputStub = this.sandbox.stub(instance, 'getOutput').returns(''),
					writeStub = this.sandbox.stub(instance, 'write'),
					outputStub = this.sandbox.stub(instance, 'output');

				instance.complete();

				expect(getOutputStub).to.have.not.been.called;
				expect(writeStub).to.have.been.calledOnce;
				expect(outputStub).to.have.not.been.called;
			});

			it('should try to output when requested but without progress', function () {
				var output = 'test',
					instance = new this.Class(this.container, { output: true, progress: false }),
					getOutputStub = this.sandbox.stub(instance, 'getOutput').returns(output),
					writeStub = this.sandbox.stub(instance, 'write'),
					outputStub = this.sandbox.stub(instance, 'output');

				instance.complete();

				expect(getOutputStub).to.have.been.calledOnce;
				expect(writeStub).to.have.been.calledOnce;

				expect(outputStub).to.have.been.calledOnce;
				expect(outputStub).to.have.been.calledWith(output);
			});

			it('should ignore output when string is empty', function () {
				var output = '',
					instance = new this.Class(this.container, { output: true, progress: false }),
					getOutputStub = this.sandbox.stub(instance, 'getOutput').returns(output),
					writeStub = this.sandbox.stub(instance, 'write'),
					outputStub = this.sandbox.stub(instance, 'output');

				instance.complete();

				expect(getOutputStub).to.have.been.calledOnce;
				expect(writeStub).to.have.been.calledOnce;
				expect(outputStub).to.not.have.been.called;
			});
		});

		describe('suiteStart()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.suiteStart();
			});
		});

		describe('suiteEnd()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.suiteEnd();
			});
		});


		describe('itemData()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.itemData();
			});
		});

		describe('itemMessage()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.itemMessage();
			});
		});


		describe('testStart()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testStart();
			});
		});

		describe('testFailed()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testFailed();
			});
		});

		describe('testError()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testError();
			});
		});

		describe('testPassed()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testPassed();
			});
		});

		describe('testUndefined()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testUndefined();
			});
		});

		describe('testSkipped()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testSkipped();
			});
		});

		describe('testIncomplete()', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.container);
			});

			it('should call', function () {
				this.instance.testIncomplete();
			});
		});
	});
});
