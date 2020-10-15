// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');
var TeamCityMessenger = require('../messenger/teamCity');

/**
 * @class TeamCityReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @property {TeamCityMessenger} _messenger
 */
var TeamCityReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._messenger = new TeamCityMessenger();
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
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			this.__super(id, parentId, suiteName);
			this._messenger.testSuiteStarted(suiteName, {id: id, msgType: 'start'});
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			this.__super(id);
			this._messenger.testSuiteFinished(this.getContainer().getAction(id).name, {id: id, msgType: 'end'});
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
			this._messenger.testStarted(testName, {id: id, msgType: 'start'});
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
			this._messenger.testFailed(action.name, false, message, reason, {id: id, msgType: 'end'});
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
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
			this._messenger.testFailed(action.name, true, message, reason, {id: id, msgType: 'end'});
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
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
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
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
			this._messenger.testFailed(action.name, true, 'Undefined', 'Undefined', {id: id, msgType: 'end'});
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
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
			this._messenger.testIgnored(action.name, reason, {id: id, msgType: 'end'});
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
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
			this._messenger.testIgnored(action.name, 'Incomplete', {id: id, msgType: 'end'});
			this._messenger.testFinished(action.name, action.duration, {id: id, msgType: 'end'});
		}
	}
);

module.exports = TeamCityReporter;
