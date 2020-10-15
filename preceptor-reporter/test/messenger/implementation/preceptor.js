// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var expect = require('chai').expect;
var sinon = require('sinon');

var fs = require('fs');
var path = require('path');

describe('Preceptor', function () {

	beforeEach(function () {
		var Class = this.messengers.preceptor;
		this.instance = new Class();
	});

	describe('_send()', function () {

		beforeEach(function () {
			this.stub = this.sandbox.stub(this.instance, 'trigger');
		});

		it('should trigger', function () {
			this.instance._send('msg-type', { test: 34 }, { option:23 });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith('#|# msg-type {"test":34} #|#\n', { option:23 });
		});
	});

	describe('_sendIntro()', function () {

		beforeEach(function () {
			this.stub = this.sandbox.stub(this.instance, 'version');
		});

		it('should send the introduction', function () {
			this.instance._sendIntro({ test:11 });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith({ test: 11 });
		});

		it('should send the introduction only once', function () {
			this.instance._sendIntro({ test:11 });
			this.instance._sendIntro({ test:12 });

			expect(this.stub).to.have.been.calledOnce;
			expect(this.stub).to.have.been.calledWith({ test: 11 });
		});
	});

	describe('Messages', function () {

		beforeEach(function () {
			this.introStub = this.sandbox.stub(this.instance, '_sendIntro');
			this.triggerStub = this.sandbox.stub(this.instance, 'trigger');
		});

		describe('version()', function () {

			it('should trigger intro', function () {
				this.instance.version();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.version({ data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# version 1 #|#\n', { data: 21 });
			});
		});

		describe('itemData()', function () {

			it('should trigger intro', function () {
				this.instance.itemData();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.itemData('14', '{"json":27}', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# itemData ["14","{\\"json\\":27}"] #|#\n', { data: 21 });
			});

			it('should send message from data', function () {
				this.instance.itemData('14', {"json":27}, { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# itemData ["14","{\\"json\\":27}"] #|#\n', { data: 21 });
			});
		});

		describe('itemMessage()', function () {

			it('should trigger intro', function () {
				this.instance.itemMessage();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.itemMessage('45', 'test-msg', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# itemMessage ["45","test-msg"] #|#\n', { data: 21 });
			});
		});

		describe('suiteStart()', function () {

			it('should trigger intro', function () {
				this.instance.suiteStart();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.suiteStart('89', '1', 'suite-name', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# suiteStart ["89","1","suite-name"] #|#\n', { data: 21 });
			});
		});

		describe('suiteEnd()', function () {

			it('should trigger intro', function () {
				this.instance.suiteEnd();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.suiteEnd('89', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# suiteEnd ["89"] #|#\n', { data: 21 });
			});
		});

		describe('testStart()', function () {

			it('should trigger intro', function () {
				this.instance.testStart();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testStart('68', '3', 'test-name', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testStart ["68","3","test-name"] #|#\n', { data: 21 });
			});
		});

		describe('testFailed()', function () {

			it('should trigger intro', function () {
				this.instance.testFailed();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testFailed('67', 'test-msg', 'reason-why', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testFailed ["67","test-msg","reason-why"] #|#\n', { data: 21 });
			});

			it('should send message with default values', function () {
				this.instance.testFailed('67');
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testFailed ["67",null,null] #|#\n', undefined);
			});
		});

		describe('testError()', function () {

			it('should trigger intro', function () {
				this.instance.testError();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testError('65', 'test-msg', 'reason-why', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testError ["65","test-msg","reason-why"] #|#\n', { data: 21 });
			});

			it('should send message with default values', function () {
				this.instance.testError('65');
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testError ["65",null,null] #|#\n', undefined);
			});
		});

		describe('testPassed()', function () {

			it('should trigger intro', function () {
				this.instance.testPassed();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testPassed('43', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testPassed ["43"] #|#\n', { data: 21 });
			});
		});

		describe('testUndefined()', function () {

			it('should trigger intro', function () {
				this.instance.testUndefined();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testUndefined('37', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testUndefined ["37"] #|#\n', { data: 21 });
			});
		});

		describe('testSkipped()', function () {

			it('should trigger intro', function () {
				this.instance.testSkipped();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testSkipped('03', 'reason-why', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testSkipped ["03","reason-why"] #|#\n', { data: 21 });
			});

			it('should send message with default values', function () {
				this.instance.testSkipped('03');
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testSkipped ["03",null] #|#\n', undefined);
			});
		});

		describe('testIncomplete()', function () {

			it('should trigger intro', function () {
				this.instance.testIncomplete();
				expect(this.introStub).to.have.been.calledOnce;
			});

			it('should send message', function () {
				this.instance.testIncomplete('26', { data: 21 });
				expect(this.triggerStub).to.have.been.calledOnce;
				expect(this.triggerStub).to.have.been.calledWith('#|# testIncomplete ["26"] #|#\n', { data: 21 });
			});
		});
	});

	it('should output data', function () {

		var actualLines = [],
			expectedFile = path.join(__dirname, 'resources', 'preceptor.txt'),
			expectedLines = fs.readFileSync(expectedFile).toString();

		this.stub = this.sandbox.stub(this.instance, 'trigger', function (msg) {
			actualLines.push(msg);
		});

		this.instance.itemData('123', ["listItem"]);
		this.instance.itemData('123', 23);
		this.instance.itemData('123', "only-string");
		this.instance.itemData('123', {obj: 23});

		this.instance.version();

		this.instance.itemMessage('123', "This is a test-message.");

		this.instance.suiteStart('123', '0', "Suite-Name");
		this.instance.suiteEnd('123');

		this.instance.testStart('123', '0', "Test-Name");
		this.instance.testFailed('123', "Division by zero", "You should not do that");
		this.instance.testError('123', "Item does not exist", "Check for being null");
		this.instance.testPassed('123');
		this.instance.testUndefined('123');
		this.instance.testSkipped('123', "DB wasn't there");
		this.instance.testIncomplete('123');

		expect(actualLines.join('')).to.be.equal(expectedLines);
	});
});
