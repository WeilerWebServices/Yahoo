// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Promise = require('promise');
var utils = require('preceptor-core').utils;

var ComparisonAdapter = require('./comparisonAdapter');

/**
 * Perceptual-Diff comparison adapter
 *
 * @class PerceptualDiffAdapter
 * @extends ComparisonAdapter
 */
var PerceptualDiffAdapter = ComparisonAdapter.extend(

	/** @lends PerceptualDiffAdapter.prototype */
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
		 * Loads a perceptual-diff instance
		 *
		 * @method _loadPerceptualDiff
		 * @return {PerceptualDiff}
		 * @private
		 */
		_loadPerceptualDiff: function () {
			var PerceptualDiff = utils.require('perceptualdiff'),
				options = utils.deepExtend({}, [this.getOptions()]);

			options.imageA = this.getImageA();
			options.imageB = this.getImageB();

			return new PerceptualDiff(options);
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
			var diff = this._loadPerceptualDiff();

			diff.run(function (err, result) {
				this._evaluateResult.call(this, err, result, diff, resolve, reject);
			}.bind(this));
		},

		/**
		 * Evaluates the result and retrieving the result image
		 *
		 * @method _evaluateResult
		 * @param {Error|null} err Possible error that occurred during the run
		 * @param {object} result Result object detailing the comparison result
		 * @param {PerceptualDiff} diff Perceptual-Diff instance
		 * @param {function} resolve Resolve function to complete comparison
		 * @param {function} reject Reject function to reject comparison with an error
		 * @private
		 */
		_evaluateResult: function (err, result, diff, resolve, reject) {
			this.setResultImage(diff._imageOutput);

			if (err) {
				reject(err);
			} else {
				resolve(diff.isPassed(result.code));
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
		TYPE: 'PerceptualDiffAdapter'
	});

module.exports = PerceptualDiffAdapter;
