// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class EventReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @event message Includes all messages
 * @event admin Includes all administrative messages
 * @event item Includes all item data messages
 * @event suite Includes all suite messages
 * @event test Includes all test messages
 *
 * @event start Start of recording
 * @event stop Stopping the recording
 * @event complete Completion
 *
 * @event itemData Data assigned to item
 * @event itemMessage Message assigned to item
 *
 * @event suiteStart Start of a suite
 * @event suiteEnd End of a suite
 *
 * @event testStart Start of a test
 * @event testFailed Marks test as failed
 * @event testError Marks test as having errors
 * @event testPassed Marks test as passed
 * @event testUndefined Marks test as undefined
 * @event testSkipped Marks test as skipped
 * @event testIncomplete Marks test as incomplete
 */
var EventReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this.on('message', function (areaType, messageType, params) {
				this.emit(areaType, messageType, params);
				this.emit(messageType, params);
			}.bind(this));
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			this.emit('message', 'admin', 'start');
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			this.emit('message', 'admin', 'stop');
		},


		/**
		 * Reporting is completed
		 *
		 * @method complete
		 */
		complete: function () {
			this.emit('message', 'admin', 'complete');
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			var args = [id, json];
			this.emit('message', 'item', 'itemData', args);
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			var args = [id, message];
			this.emit('message', 'item', 'itemMessage', args);
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
			var args = [id, parentId, suiteName];
			this.emit('message', 'suite', 'suiteStart', args);
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			var args = [id];
			this.emit('message', 'suite', 'suiteEnd', args);
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
			var args = [id, parentId, testName];
			this.emit('message', 'test', 'testStart', args);
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
			var args = [id, message, reason];
			this.emit('message', 'test', 'testFailed', args);
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
			var args = [id, message, reason];
			this.emit('message', 'test', 'testError', args);
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			var args = [id];
			this.emit('message', 'test', 'testPassed', args);
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			var args = [id];
			this.emit('message', 'test', 'testUndefined', args);
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			var args = [id, reason];
			this.emit('message', 'test', 'testSkipped', args);
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			var args = [id];
			this.emit('message', 'test', 'testIncomplete', args);
		}
	}
);

module.exports = EventReporter;
