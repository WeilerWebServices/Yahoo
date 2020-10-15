// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractMessenger = require('../abstractMessenger');
var _ = require('underscore');

/**
 * @class TeamCity messenger
 * @extends AbstractMessenger
 * @constructor
 */
var TeamCityMessenger = AbstractMessenger.extend(

	{
		/**
		 * Escape teamcity message
		 *
		 * @method _escape
		 * @param {string} msg
		 * @return {string}
		 * @private
		 */
		_escape: function (msg) {
			return (msg + '')
				.replace(/\|/g, "||")
				.replace(/'/g, "|'")
				.replace(/\n/g, "|n")
				.replace(/\r/g, "|r")
				.replace(/\[/g, "|[")
				.replace(/]/g, "|]");
		},

		/**
		 * Sends a message
		 *
		 * @method _send
		 * @param {string} messageType
		 * @param {object} data
		 * @param {object} [options]
		 * @private
		 */
		_send: function (messageType, data, options) {
			var outputData = [],
				outputText = '';

			_.keys(data || {}).forEach(function (key) {
				outputData.push(this._escape(key) + "='" + this._escape(data[key]) + "'");
			}.bind(this));

			if (outputData.length > 0) {
				outputText = ' ' + outputData.join(' ');
			}

			this.trigger("##teamcity[" + messageType + outputText + "]\n", options);
		},


		/**
		 * Suite starts
		 *
		 * @method testSuiteStarted
		 * @param {string} suiteName
		 * @param {object} [options]
		 */
		testSuiteStarted: function (suiteName, options) {
			this._send("testSuiteStarted", {name: suiteName}, options);
		},

		/**
		 * Suite ends
		 *
		 * @method testSuiteFinished
		 * @param {string} suiteName
		 * @param {object} [options]
		 */
		testSuiteFinished: function (suiteName, options) {
			this._send("testSuiteFinished", {name: suiteName}, options);
		},


		/**
		 * Test starts
		 *
		 * @method testStarted
		 * @param {string} testName
		 * @param {object} [options]
		 */
		testStarted: function (testName, options) {
			this._send("testStarted", {name: testName}, options);
		},

		/**
		 * Test starts
		 *
		 * @method testFinished
		 * @param {string} testName
		 * @param {int} duration Duration in ms
		 * @param {object} [options]
		 */
		testFinished: function (testName, duration, options) {
			this._send("testFinished", {name: testName, duration: duration}, options);
		},


		/**
		 * Test fails
		 *
		 * @method testFailed
		 * @param {string} testName
		 * @param {boolean} [error=false]
		 * @param {string} [message]
		 * @param {string} [details]
		 * @param {object} [options]
		 */
		testFailed: function (testName, error, message, details, options) {
			if (error) {
				this._send("testFailed", {
					name: testName,
					message: message || '',
					details: details || '',
					error: 'true'
				}, options);
			} else {
				this._send("testFailed", {
					name: testName,
					message: message || '',
					details: details || ''
				}, options);
			}
		},

		/**
		 * Test is ignored
		 *
		 * @method testIgnored
		 * @param {string} testName
		 * @param {string} [message]
		 * @param {object} [options]
		 */
		testIgnored: function (testName, message, options) {
			this._send("testIgnored", {name: testName, message: message || ''}, options);
		}
	}
);

module.exports = TeamCityMessenger;
