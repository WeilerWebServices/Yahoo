// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class DotReporter
 * @extends AbstractReporter
 * @constructor
 */
var DotReporter = AbstractReporter.extend(

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
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			this.__super();
			this.console(undefined, "stop", "\n\n");
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
			var begin = '', end = '';

			this.__super(id, message, reason);

			if (this.useColor()) {
				begin = '\x1B[31m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + 'F' + end);
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
			var begin = '', end = '';

			this.__super(id, message, reason);

			if (this.useColor()) {
				begin = '\x1B[31m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + 'E' + end);
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			var begin = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				begin = '\x1B[32m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + '.' + end);
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			var begin = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				begin = '\x1B[33m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + 'U' + end);
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			var begin = '', end = '';

			this.__super(id, reason);

			if (this.useColor()) {
				begin = '\x1B[35m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + 'S' + end);
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			var begin = '', end = '';

			this.__super(id);

			if (this.useColor()) {
				begin = '\x1B[34m';
				end = '\x1B[0m';
			}

			this.console(id, 'end', begin + 'I' + end);
		}
	}
);

module.exports = DotReporter;
