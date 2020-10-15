// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;

var defaultsMessenger = require('./defaults/messenger');

/**
 * AbstractMessenger messenger
 *
 * @class AbstractMessenger
 * @extends Base
 *
 * @property {object} _options
 *
 * @event message
 */
var AbstractMessenger = Base.extend(

	/**
	 * @param {object} [options]
	 * @param {boolean} [options.output=false]
	 * @constructor
	 */
	function (options) {
		this.__super();

		this._options = utils.deepExtend({}, [defaultsMessenger, options || {}]);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Nothing yet
		},


		/**
		 * Gets the options
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options || {};
		},

		/**
		 * Should the messages be printed?
		 *
		 * @method shouldOutput
		 * @return {boolean}
		 */
		shouldOutput: function () {
			return !!this.getOptions().output;
		},


		/**
		 * Triggers a message
		 *
		 * @method trigger
		 * @param {string} msg
		 * @param {object} [options]
		 */
		trigger: function (msg, options) {

			this.emit('message', msg, options || {});

			if (this.shouldOutput()) {
				this.output(msg);
			}
		},

		/**
		 * Outputs data to stdout
		 *
		 * @method output
		 * @param {string} data
		 */
		output: function (data) {
			process.stdout.write(data);
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractMessenger'
	}
);

module.exports = AbstractMessenger;
