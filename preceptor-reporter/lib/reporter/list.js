// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class ListReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @property {int} _commentCounter
 * @property {object[]} _list
 */
var ListReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			if (this.getOptions().progress === undefined) {
				this.getOptions().progress = false;
			}
			if (this.getOptions().output === undefined) {
				this.getOptions().output = true;
			}
		},


		/**
		 * Spacing
		 *
		 * @method _spacing
		 * @param {int} count
		 * @return {string}
		 * @private
		 */
		_spacing: function (count) {
			return new Array(count + 3).join(' ');
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			this.__super();

			this._commentCounter = 0;
			this._list = [];
		},

		/**
		 * Called when reporting stops
		 *
		 * @Method stop
		 */
		stop: function () {
			var start, end, number;

			this.__super();

			(this._list || []).forEach(function (entry) {

				start = '';
				end = '';

				if (this.useColor()) {

					if (entry.type === 'failed') {
						start = '\x1B[31m';
						end = '\x1B[0m';

					} else if (entry.type === 'error') {
						start = '\x1B[31m';
						end = '\x1B[0m';

					} else if (entry.type === 'skipped') {
						start = '\x1B[35m';
						end = '\x1B[0m';

					} else if (entry.type === 'undefined') {
						start = '\x1B[33m';
						end = '\x1B[0m';
					}
				}

				number = entry.nmbr + ") ";

				this.console(undefined, "stop", this._spacing(0) + entry.nmbr + ") " + entry.fullName + "\n");
				this.console(undefined, "stop", this._spacing(number.length) + start + entry.message + end + "\n");
				if (entry.reason) {
					this.console(undefined, "stop", entry.reason + "\n");
				}
				this.console(undefined, "stop", "\n");
			}.bind(this));
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

			this._commentCounter++;
			this._list.push({
				nmbr: this._commentCounter,
				name: this.getContainer().getAction(id).name,
				fullName: this.getContainer().getFullName(id),
				message: message,
				reason: reason,
				type: 'failed'
			});
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

			this._commentCounter++;
			this._list.push({
				nmbr: this._commentCounter,
				name: this.getContainer().getAction(id).name,
				fullName: this.getContainer().getFullName(id),
				message: message,
				reason: reason,
				type: 'error'
			});
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			this.__super(id);

			this._commentCounter++;
			this._list.push({
				nmbr: this._commentCounter,
				name: this.getContainer().getAction(id).name,
				fullName: this.getContainer().getFullName(id),
				message: 'Undefined',
				reason: null,
				type: 'undefined'
			});
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

			this._commentCounter++;
			this._list.push({
				nmbr: this._commentCounter,
				name: this.getContainer().getAction(id).name,
				fullName: this.getContainer().getFullName(id),
				message: reason,
				reason: null,
				type: 'skipped'
			});
		}
	}
);

module.exports = ListReporter;
