// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Promise = require('promise');
var utils = require('preceptor-core').utils;

var ComparisonAdapter = require('./comparisonAdapter');

/**
 * Blink-Diff comparison adapter
 *
 * @class BlinkDiffAdapter
 * @extends ComparisonAdapter
 */
var BlinkDiffAdapter = ComparisonAdapter.extend(

	/** @lends BlinkDiffAdapter.prototype */
	{
		/**
		 * Runs the comparison
		 *
		 * @method run
		 * @return {Promise} With {boolean} for success/failure
		 */
		run : function () {
			return new Promise(function (resolve, reject) {
				this._runPromise.call(this, resolve, reject);
			}.bind(this));
		},

		/**
		 * Loads a blink-diff instance
		 *
		 * @method _loadBlinkDiff
		 * @return {BlinkDiff}
		 * @private
		 */
		_loadBlinkDiff: function () {
			var BlinkDiff = utils.require('blink-diff'),
				options = utils.deepExtend({}, [this.getOptions()]);

			options.imageA = this.getImageA();
			options.imageB = this.getImageB();

			return new BlinkDiff(options);
		},

		/**
		 * Runs the promise
		 *
		 * @method _runPromise
		 * @param {function} resolve Resolve function to complete comparison
		 * @param {function} reject Reject function to reject comparison with an error
		 * @private
		 */
		_runPromise: function (resolve, reject) {
			var blinkDiff = this._loadBlinkDiff();

			blinkDiff.run(function (err, result) {
				this._evaluateResult.call(this, err, result, blinkDiff, resolve, reject);
			}.bind(this));
		},

		/**
		 * Evaluates the result and retrieving the result image
		 *
		 * @method _evaluateResult
		 * @param {Error|null} err Possible error that occurred during the run
		 * @param {object} result Result object detailing the comparison result
		 * @param {BlinkDiff} blinkDiff Blink-Diff instance
		 * @param {function} resolve Resolve function to complete comparison
		 * @param {function} reject Reject function to reject comparison with an error
		 * @private
		 */
		_evaluateResult: function (err, result, blinkDiff, resolve, reject) {
			this.setResultImage(blinkDiff._imageOutput);

			if (err) {
				reject(err);
			} else {
				resolve(blinkDiff.hasPassed(result.code));
			}
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @property TYPE
		 * @type string
		 */
		TYPE: 'BlinkDiffAdapter'
	});

module.exports = BlinkDiffAdapter;
