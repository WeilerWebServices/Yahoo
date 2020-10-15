// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractMessenger = require('../abstractMessenger');

/**
 * @class PreceptorMessenger
 * @extends AbstractMessenger
 * @constructor
 */
var PreceptorMessenger = AbstractMessenger.extend(

	{
		/**
		 * Sends a message
		 *
		 * @method _send
		 * @param {string} messageType
		 * @param {*} data
		 * @param {object} [options]
		 * @private
		 */
		_send: function (messageType, data, options) {
			this.trigger('#|# ' + messageType + " " + JSON.stringify(data) + " #|#\n", options);
		},


		/**
		 * Sends intro message
		 *
		 * @method _sendIntro
		 * @param {object} [options]
		 * @private
		 */
		_sendIntro: function (options) {
			if (!this._introSent) {
				this._introSent = true;
				this.version(options);
			}
		},


		/**
		 * Sends the version as message
		 *
		 * @method version
		 * @param {object} [options]
		 */
		version: function (options) {
			this._sendIntro();
			this._send("version", 1, options);
		},


		/**
		 * Item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json Data in JSON format
		 * @param {object} [options]
		 */
		itemData: function (id, json, options) {
			this._sendIntro();
			if (typeof json !== 'string') {
				json = JSON.stringify(json);
			}
			this._send("itemData", [id, json], options);
		},

		/**
		 * Item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 * @param {object} [options]
		 */
		itemMessage: function (id, message, options) {
			this._sendIntro();
			this._send("itemMessage", [id, message], options);
		},


		/**
		 * Suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 * @param {object} [options]
		 */
		suiteStart: function (id, parentId, suiteName, options) {
			this._sendIntro();
			this._send("suiteStart", [id, parentId, suiteName], options);
		},

		/**
		 * Suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 * @param {object} [options]
		 */
		suiteEnd: function (id, options) {
			this._sendIntro();
			this._send("suiteEnd", [id], options);
		},


		/**
		 * Test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 * @param {object} [options]
		 */
		testStart: function (id, parentId, testName, options) {
			this._sendIntro();
			this._send("testStart", [id, parentId, testName], options);
		},


		/**
		 * Test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 * @param {object} [options]
		 */
		testFailed: function (id, message, reason, options) {
			this._sendIntro();
			this._send("testFailed", [id, message, reason], options);
		},

		/**
		 * Test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 * @param {object} [options]
		 */
		testError: function (id, message, reason, options) {
			this._sendIntro();
			this._send("testError", [id, message, reason], options);
		},

		/**
		 * Test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 * @param {object} [options]
		 */
		testPassed: function (id, options) {
			this._sendIntro();
			this._send("testPassed", [id], options);
		},

		/**
		 * Test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 * @param {object} [options]
		 */
		testUndefined: function (id, options) {
			this._sendIntro();
			this._send("testUndefined", [id], options);
		},

		/**
		 * Test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 * @param {object} [options]
		 */
		testSkipped: function (id, reason, options) {
			this._sendIntro();
			this._send("testSkipped", [id, reason], options);
		},

		/**
		 * Test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 * @param {object} [options]
		 */
		testIncomplete: function (id, options) {
			this._sendIntro();
			this._send("testIncomplete", [id], options);
		}
	}
);

module.exports = PreceptorMessenger;
