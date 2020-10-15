// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

var fs = require('fs');
var path = require('path');

describe('TeamCity', function () {

	beforeEach(function () {
		var Class = this.messengers.teamcity;
		this.instance = new Class();
	});

	describe('_escape()', function () {

		it('should escape a non-string', function () {
			expect(this.instance._escape(5)).to.be.equal('5');
		});

		it('should escape "|"', function () {
			expect(this.instance._escape('test1|test2')).to.be.equal('test1||test2');
		});

		it('should escape "\'"', function () {
			expect(this.instance._escape("test1'test2")).to.be.equal("test1|'test2");
		});

		it('should escape "\\n"', function () {
			expect(this.instance._escape('test1\ntest2')).to.be.equal('test1|ntest2');
		});

		it('should escape "\\r"', function () {
			expect(this.instance._escape('test1\rtest2')).to.be.equal('test1|rtest2');
		});

		it('should escape "["', function () {
			expect(this.instance._escape('test1[test2')).to.be.equal('test1|[test2');
		});

		it('should escape "]"', function () {
			expect(this.instance._escape('test1]test2')).to.be.equal('test1|]test2');
		});
	});

	describe('_send()', function () {

		beforeEach(function () {
			this.stub = this.sandbox.stub(this.instance, 'trigger');
		});

		it('should trigger', function () {
			this.instance._send('msg-type');

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type]\n");
		});

		it('should trigger with options', function () {
			this.instance._send('msg-type', null, { option:23 });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type]\n", { option:23 });
		});

		it('should trigger with data object', function () {
			this.instance._send('msg-type', {});

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type]\n", undefined);
		});

		it('should trigger with single data entry', function () {
			this.instance._send('msg-type', { test: 34 });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type test='34']\n", undefined);
		});

		it('should combine multiple data entries', function () {
			this.instance._send('msg-type', { test: 34, data: 'hello' });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type test='34' data='hello']\n", undefined);
		});

		it('should escape data values', function () {
			this.instance._send('msg-type', { data: 'he[llo' });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type data='he|[llo']\n", undefined);
		});

		it('should escape data keys', function () {
			this.instance._send('msg-type', { 'da[ta': 'hello' });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith("##teamcity[msg-type da|[ta='hello']\n", undefined);
		});
	});

	describe('Messages', function () {

		beforeEach(function () {
			this.triggerStub = this.sandbox.stub(this.instance, 'trigger');
		});

		describe('testSuiteStarted()', function () {

			it('should send message', function () {
				this.instance.testSuiteStarted('suite-name', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testSuiteStarted name='suite-name']\n", { data: 21 });
			});
		});

		describe('testSuiteFinished()', function () {

			it('should send message', function () {
				this.instance.testSuiteFinished('suite-name', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testSuiteFinished name='suite-name']\n", { data: 21 });
			});
		});

		describe('testStarted()', function () {

			it('should send message', function () {
				this.instance.testStarted('test-name', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testStarted name='test-name']\n", { data: 21 });
			});
		});

		describe('testFinished()', function () {

			it('should send message', function () {
				this.instance.testFinished('test-name', 54, { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testFinished name='test-name' duration='54']\n", { data: 21 });
			});
		});

		describe('testFailed()', function () {

			it('should send message as failure', function () {
				this.instance.testFailed('test-name', false, 'error-msg', 'details of err', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testFailed name='test-name' message='error-msg' details='details of err']\n", { data: 21 });
			});

			it('should send message as failure with default values', function () {
				this.instance.testFailed('test-name');
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testFailed name='test-name' message='' details='']\n", undefined);
			});

			it('should send message as error', function () {
				this.instance.testFailed('test-name', true, 'error-msg', 'details of err', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testFailed name='test-name' message='error-msg' details='details of err' error='true']\n", { data: 21 });
			});

			it('should send message as error with default values', function () {
				this.instance.testFailed('test-name', true);
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testFailed name='test-name' message='' details='' error='true']\n", undefined);
			});
		});

		describe('testIgnored()', function () {

			it('should send message', function () {
				this.instance.testIgnored('test-name', 'ignore-msg', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testIgnored name='test-name' message='ignore-msg']\n", { data: 21 });
			});

			it('should send message with default values', function () {
				this.instance.testIgnored('test-name');
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith("##teamcity[testIgnored name='test-name' message='']\n", undefined);
			});
		});
	});

	it('should output data', function () {

		var actualLines = [],
			expectedFile = path.join(__dirname, 'resources', 'teamCity.txt'),
			expectedLines = fs.readFileSync(expectedFile).toString();

		this.stub = this.sandbox.stub(this.instance, 'trigger', function (msg) {
			actualLines.push(msg);
		});

		this.instance.testSuiteStarted("test-suite");
		this.instance.testStarted("test-case");
		this.instance.testFinished("test-case", 23);
		this.instance.testFailed("test-case", false, "Division by zero", "You should not do that");
		this.instance.testFailed("test-case", true, "Item does not exist", "Check for being null");
		this.instance.testIgnored("test-case", "DB wasn't there");
		this.instance.testSuiteFinished("test-suite");

		expect(actualLines.join('')).to.be.equal(expectedLines);
	});
});
