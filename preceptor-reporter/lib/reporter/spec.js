// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class SpecReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @property {int} _commentCounter
 */
var SpecReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			if (this.getOptions().progress === undefined) {
				this.getOptions().progress = true;
			}
			if (this.getOptions().output === undefined) {
				this.getOptions().output = true;
			}
		},


		/**
		 * Spacing for object
		 *
		 * @method _spacing
		 * @param {object} obj
		 * @return {string}
		 * @private
		 */
		_spacing: function (obj) {
			return new Array(obj.level + 1).join('  ');
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			this.__super();

			this._commentCounter = 0;
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			this.__super();
			this.console(undefined, 'stop', "\n");
		},


		/**
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			this.__super(id, parentId, suiteName);
			this.console(id, 'start', "\n" + this._spacing(this.getContainer().getAction(id)) + suiteName + "\n");
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			this.__super(id);
		},


		/**
		 * Called when test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testFailed: function (id, message, reason) {
			var action = this.getContainer().getAction(id), start = '', end = '';

			this.__super(id, message, reason);

			if (this.useColor()) {
				start = '\x1B[31m';
				end = '\x1B[0m';
			}
			this._commentCounter++;
			this.console(id, 'end', this._spacing(action) + start + this._commentCounter + ') ' + action.name + end + "\n");
		},

		/**
		 * Called when test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testError: function (id, message, reason) {
			var action = this.getContainer().getAction(id), start = '', end = '';

			this.__super(id, message, reason);

			if (this.useColor()) {
				start = '\x1B[31m';
				end = '\x1B[0m';
			}
			this._commentCounter++;
			this.console(id, 'end', this._spacing(action) + start + this._commentCounter + ') ' + action.name + end + "\n");
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			var action = this.getContainer().getAction(id), checkMark = '✓', start = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				checkMark = '\x1B[32m' + checkMark + '\x1B[0m';
				start = '\x1B[37m';
				end = '\x1B[0m';
			}
			this.console(id, 'end', this._spacing(action) + checkMark + ' ' + start + action.name + end + "\n");
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			var action = this.getContainer().getAction(id), start = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				start = '\x1B[33m';
				end = '\x1B[0m';
			}
			this._commentCounter++;
			this.console(id, 'end', this._spacing(action) + start + this._commentCounter + ') ' + action.name + end + "\n");
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			var action = this.getContainer().getAction(id), start = '', end = '';

			this.__super(id, reason);

			if (this.useColor()) {
				start = '\x1B[35m';
				end = '\x1B[0m';
			}
			this._commentCounter++;
			this.console(id, 'end', this._spacing(action) + start + this._commentCounter + ') ' + action.name + end + "\n");
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			var action = this.getContainer().getAction(id), dash = '-', start = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				start = '\x1B[34m';
				end = '\x1B[0m';
			}
			this.console(id, 'end', this._spacing(action) + start + dash + ' ' + action.name + end + "\n");
		}
	}
);

module.exports = SpecReporter;
