var BlinkDiffAdapter = require('../../').comparisonAdapters.blinkdiff;

var Promise = require('promise');

var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var expect = chai.expect;

chai.use(sinonChai);

/**
 * Creates an image to be set
 *
 * Note:
 * This actually returns a random object since there is nothing specific about the image-object.
 *
 * @method createImage
 * @return {PNGImage}
 */
function createImage() {
	return {
		randomProperties: 'is here',
		value: Math.floor(Math.random() * 1000)
	};
}

describe('Blink-Diff', function () {

	describe('Unit', function () {

		beforeEach(function () {
			this.sandbox = sinon.sandbox.create();

			this.instance = new BlinkDiffAdapter();

			this.error = new Error('test-error');
			this.result = { code: 1 };
			this.blinkDiff = {
				_imageA: createImage(),
				_imageB: createImage(),
				_imageOutput: null,
				hasPassed: this.sandbox.stub(),
				run: this.sandbox.stub()
			};
			this.resolveFn = this.sandbox.stub();
			this.rejectFn = this.sandbox.stub();
		});

		afterEach(function () {
			this.sandbox.restore();
			this.sandbox = null;
		});

		describe('_evaluateResult', function () {

			beforeEach(function () {
				this.blinkDiff._imageOutput = createImage();
			});

			it('should call setResultImage on success', function () {

				// Setup
				this.blinkDiff.hasPassed.returns(true);

				// Execute
				this.instance._evaluateResult(null, this.result, this.blinkDiff, this.resolveFn, this.rejectFn);

				// Verify
				expect(this.instance.getResultImage()).to.be.deep.equal(this.blinkDiff._imageOutput);

				expect(this.rejectFn).to.be.not.called;
				expect(this.resolveFn).to.be.calledOnce;
				expect(this.resolveFn.lastCall.args).to.be.an('array');
				expect(this.resolveFn.lastCall.args.length).to.be.equal(1);
				expect(this.resolveFn.lastCall.args[0]).to.be.equal(true);

				expect(this.blinkDiff.hasPassed).to.be.calledOnce;
				expect(this.blinkDiff.hasPassed.lastCall.args).to.be.an('array');
				expect(this.blinkDiff.hasPassed.lastCall.args.length).to.be.equal(1);
				expect(this.blinkDiff.hasPassed.lastCall.args[0]).to.be.equal(this.result.code);
			});

			it('should call setResultImage on error', function () {

				// Setup
				this.blinkDiff.hasPassed.returns(false);

				// Execute
				this.instance._evaluateResult(this.error, null, this.blinkDiff, this.resolveFn, this.rejectFn);

				// Verify
				expect(this.instance.getResultImage()).to.be.deep.equal(this.blinkDiff._imageOutput);

				expect(this.resolveFn).to.be.not.called;
				expect(this.rejectFn).to.be.calledOnce;
				expect(this.rejectFn.lastCall.args).to.be.an('array');
				expect(this.rejectFn.lastCall.args.length).to.be.equal(1);
				expect(this.rejectFn.lastCall.args[0]).to.be.equal(this.error);

				expect(this.blinkDiff.hasPassed).to.not.be.called;
			});
		});

		describe('_runPromise', function () {

			it('should execute _runPromise', function () {

				var fn;

				// Setup
				this.instance._loadBlinkDiff = this.sandbox.stub().returns(this.blinkDiff);
				this.instance._evaluateResult = this.sandbox.stub();

				// Execute
				this.instance._runPromise(this.resolveFn, this.rejectFn);

				// Validate internal call
				expect(this.blinkDiff.run).to.be.calledOnce;
				expect(this.blinkDiff.run.lastCall.args).to.be.an('array');
				expect(this.blinkDiff.run.lastCall.args.length).to.be.equal(1);
				expect(this.blinkDiff.run.lastCall.args[0]).to.be.a('function');

				// Execute internal call
				fn = this.blinkDiff.run.lastCall.args[0];
				fn = this.sandbox.spy(fn);
				fn(this.error, this.result);

				// Validate
				expect(this.instance._evaluateResult).to.be.calledOnce;
				expect(this.instance._evaluateResult.lastCall.args).to.be.an('array');
				expect(this.instance._evaluateResult.lastCall.args.length).to.be.equal(5);
				expect(this.instance._evaluateResult.lastCall.args).to.be.deep.equal(
					[this.error, this.result, this.blinkDiff, this.resolveFn, this.rejectFn]
				);
			});
		});
	});
});
