// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');
var util = require('util');

/**
 * @class PlainReporter
 * @extends AbstractReporter
 * @constructor
 */
var PlainReporter = AbstractReporter.extend(

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
		 * Escape message
		 *
		 * @method _escape
		 * @param {string} msg
		 * @return {string}
		 * @private
		 */
		_escape: function (msg) {
			return (msg + '').replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
		},


		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			this.__super();
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
			this.console(id, 'start', util.format("suiteStarted name='%s'", this._escape(suiteName)) + "\n");
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			this.__super(id);
			this.console(id, 'end', util.format("suiteFinished name='%s'", this._escape(this.getContainer().getAction(id).name)) + "\n");
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			var action;

			this.__super(id, json);

			action = this.getContainer().getAction(id);
			this.console(id, 'start', util.format("itemData name='%s' data='%s'", this._escape(action.name), this._escape(json)) + "\n");
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			var action;

			this.__super(id, message);

			action = this.getContainer().getAction(id);
			this.console(id, 'start', util.format("itemMessage name='%s' message='%s'", this._escape(action.name), this._escape(message)) + "\n");
		},


		/**
		 * Called when test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 */
		testStart: function (id, parentId, testName) {
			this.__super(id, parentId, testName);
			this.console(id, 'start', util.format("testStarted name='%s'", this._escape(testName)) + "\n");
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
			var action;

			this.__super(id, message, reason);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testFailed name='%s' message='%s' details='%s'", this._escape(action.name), this._escape(message), this._escape(reason)) + "\n");
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
			var action;

			this.__super(id, message, reason);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testError name='%s' message='%s' details='%s'", this._escape(action.name), this._escape(message), this._escape(reason)) + "\n");
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			var action;

			this.__super(id);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testPassed name='%s' duration='%s'", this._escape(action.name), this._escape(action.duration)) + "\n");
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			var action;

			this.__super(id);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testUndefined name='%s'", this._escape(action.name)) + "\n");
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			var action;

			this.__super(id, reason);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testSkipped name='%s' message='%s'", this._escape(action.name), this._escape(reason)) + "\n");
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			var action;

			this.__super(id);

			action = this.getContainer().getAction(id);
			this.console(id, 'end', util.format("testIncomplete name='%s'", this._escape(action.name)) + "\n");
		}
	}
);

module.exports = PlainReporter;
