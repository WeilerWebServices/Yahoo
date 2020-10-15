// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');
var util = require('util');
var PreceptorMessenger = require('../messenger/preceptor');

/**
 * @class PreceptorReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @property {PreceptorMessenger} _messenger
 */
var PreceptorReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._messenger = new PreceptorMessenger();
			this._messenger.on('message', function (text, options) {
				this.console(options.id, options.msgType, text);
			}.bind(this));

			if (this.getOptions().progress === undefined) {
				this.getOptions().progress = true;
			}
			if (this.getOptions().output === undefined) {
				this.getOptions().output = true;
			}
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			this.__super();
			this.console(undefined, "start", util.format("#|# version 1 #|#\n"), {id: undefined, msgType: 'start'});
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			this.__super(id, json);
			this._messenger.itemData(id, json, {id: id, msgType: 'start'});
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			this.__super(id, message);
			this._messenger.itemMessage(id, message, {id: id, msgType: 'start'});
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
			this._messenger.suiteStart(id, parentId, suiteName, {id: id, msgType: 'start'});
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			this.__super(id);
			this._messenger.suiteEnd(id, {id: id, msgType: 'end'});
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
			this._messenger.testStart(id, parentId, testName, {id: id, msgType: 'start'});
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
			this.__super(id, message, reason);
			this._messenger.testFailed(id, message, reason, {id: id, msgType: 'end'});
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
			this.__super(id, message, reason);
			this._messenger.testError(id, message, reason, {id: id, msgType: 'end'});
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			this.__super(id);
			this._messenger.testPassed(id, {id: id, msgType: 'end'});
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			this.__super(id);
			this._messenger.testUndefined(id, {id: id, msgType: 'end'});
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			this.__super(id, reason);
			this._messenger.testSkipped(id, reason, {id: id, msgType: 'end'});
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			this.__super(id);
			this._messenger.testIncomplete(id, {id: id, msgType: 'end'});
		}
	}
);

module.exports = PreceptorReporter;
