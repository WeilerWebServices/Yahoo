// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var _ = require('underscore');

var defaultsListener = require('./defaults/listener');

/**
 * @class AbstractListener
 * @extends Base
 *
 * @property {object} _options
 * @property {ReportManager} _manager
 *
 * @event message
 */
var AbstractListener = Base.extend(

	/**
	 * Abstract listener constructor
	 *
	 * @param {object} [options]
	 * @param {object} [options.configuration]
	 * @param {object} [options.placeholder]
	 * @constructor
	 */
	function (options) {
		this.__super();

		this._options = utils.deepExtend({}, [defaultsListener, options || {}]);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
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
		 * Gets the configuration supplied
		 *
		 * @method getConfiguration
		 * @return {object}
		 */
		getConfiguration: function () {
			return this.getOptions().configuration || {};
		},

		/**
		 * Gets the placeholder and their replacements
		 *
		 * @method getPlaceholder
		 * @return {object}
		 */
		getPlaceholder: function () {
			return this.getOptions().placeholder || {};
		},


		/**
		 * Triggers a message
		 *
		 * @method triggerMessage
		 * @param {string} messageType
		 * @param {*[]} data
		 */
		triggerMessage: function (messageType, data) {
			this.emit("message", messageType, data);
		},


		/**
		 * Parses a string and extracts message information
		 *
		 * @method parse
		 * @param {string} text
		 * @param {object} [placeholder]
		 * @return {string}
		 */
		parse: function (text, placeholder) {
			throw new Error('Unimplemented listener method "process".');
		},


		/**
		 * Processes a text with the placeholder
		 *
		 * @method processPlaceholder
		 * @param {string} text
		 * @param {object} [placeholder]
		 * @return {string}
		 */
		processPlaceholder: function (text, placeholder) {
			var localPlaceholder, localText = text;

			// Directly supplied placeholder have priority
			if (placeholder) {
				_.keys(placeholder).forEach(function (key) {
					localText = localText.replace(key, placeholder[key]);
				});
			}

			// Try to find any placeholder from the global list
			localPlaceholder = this.getPlaceholder();
			_.keys(localPlaceholder).forEach(function (key) {
				localText = localText.replace(key, localPlaceholder[key]);
			});

			return localText;
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractListener'
	}
);

module.exports = AbstractListener;
