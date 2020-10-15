// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractListener = require('../abstractListener');
var _ = require('underscore');

/**
 * @class TeamCity listener
 * @extends AbstractListener
 * @constructor
 */
var TeamCityListener = AbstractListener.extend(

	{
		/**
		 * Gets the parent-id of the team-city root messages
		 *
		 * @method getParentId
		 * @return {string}
		 */
		getParentId: function () {
			return this.getConfiguration().parentId;
		},


		/**
		 * Unescapes teamcity messages
		 *
		 * @method _unescape
		 * @param {string} msg
		 * @return {string}
		 * @private
		 */
		_unescape: function (msg) {
			return (msg + '')
				.replace(/\|\|/g, "|")
				.replace(/\|'/g, "'")
				.replace(/\|n/g, "\n")
				.replace(/\|r/g, "\r")
				.replace(/\|\[/g, "[")
				.replace(/\|\]/g, "]");
		},


		/**
		 * Gets a list of relayed messages
		 *
		 * @method getRelayedMessages
		 * @return {object}
		 */
		getRelayedMessages: function () {
			return {
				'testSuiteStarted': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}],
				'testSuiteFinished': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}],
				'testStarted': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}],
				'testFinished': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}, {
					name: 'duration',
					defaultValue: '0',
					type: 'int'
				}],
				'testFailed': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}, {
					name: 'message',
					defaultValue: '-',
					type: 'string'
				}, {name: 'details', defaultValue: '-', type: 'string'}],
				'testError': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}, {
					name: 'message',
					defaultValue: '-',
					type: 'string'
				}, {name: 'details', defaultValue: '-', type: 'string'}],
				'testIgnored': [{name: 'name', defaultValue: 'Undeclared', type: 'string'}, {
					name: 'message',
					defaultValue: '-',
					type: 'string'
				}]
			};
		},

		/**
		 * Gets the mapping from TeamCity into Preceptor format
		 *
		 * @method getMessageMapping
		 * @return {object[]}
		 */
		getMessageMapping: function () {
			return {
				testSuiteStarted: 'suiteStart',
				testSuiteFinished: 'suiteEnd',
				testStarted: 'testStart',
				testFinished: 'testFinished', // Will not be used - possibly relayed to testPassed
				testFailed: 'testFailed',
				testError: 'testError',
				testIgnored: 'testSkipped'
			};
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

			var messageType,
				data,
				localText = text,
				relayedMessaged = this.getRelayedMessages(),
				messageTypes = _.keys(relayedMessaged),
				messageMapping = this.getMessageMapping(),
				match = true,
				args,
				currentId,
				idCounter = 0,
				id = +(new Date()),
				idStack = [this.getParentId()],
				idList = {};

			while (match) {

				match = localText.match(/^##teamcity\[(\w*?)\s(.*?)]$/m);

				if (match) {
					messageType = match[1];
					data = match[2];

					// Remove data from stream
					localText = localText.replace(match[0] + "\n", "");

					if (messageTypes.indexOf(messageType) !== -1) {

						data = this.processPlaceholder(data, placeholder);

						// Convert a failed to an error if parameter given
						if ((messageType === 'testFailed') && this._parseAttribute(data, 'error', false)) {
							messageType = 'testError';
						}

						args = this._parseAttributes(data, relayedMessaged[messageType]);

						messageType = messageMapping[messageType];

						if (['suiteStart', 'testStart'].indexOf(messageType) !== -1) {
							currentId = id + '-' + (++idCounter);
							idList[args[0]] = currentId;
							args.unshift(idList[idStack[0]]);
							args.unshift(currentId);
							idStack.unshift(args[2]);

						} else if (['testFinished'].indexOf(messageType) !== -1) {

							if (args[0] === idStack[0]) {
								messageType = 'testPassed';
								args.shift();
								args.unshift(idList[idStack[0]]);
								idStack.shift();
							} else {
								continue;
							}

						} else if (args[0] === idStack[0]) {
							args.shift();
							args.unshift(idList[idStack[0]]);
							idStack.shift();

						} else {
							throw new Error('An error was encountered during parsing team-city code: ' + data);
						}

						this.triggerMessage(messageType, args);
					}
				}
			}

			return localText;
		},


		/**
		 * Parses all attributes and returns a list of attributes in the correct order
		 *
		 * @method _parseAttributes
		 * @param {string} attributes
		 * @param {object[]} parameters
		 * @return {*[]}
		 * @private
		 */
		_parseAttributes: function (attributes, parameters) {
			var attributeValue, args = [];

			(parameters || []).forEach(function (parameter) {
				attributeValue = this._parseAttribute(attributes, parameter.name, parameter.defaultValue);
				attributeValue = this._castAttribute(attributeValue, parameter.type);

				args.push(attributeValue);
			}.bind(this));

			return args;
		},

		/**
		 * Parses a specific attribute
		 *
		 * @method _parseAttribute
		 * @param {string} attributes
		 * @param {string} attributeName
		 * @param {*} defaultValue
		 * @return {*}
		 * @private
		 */
		_parseAttribute: function (attributes, attributeName, defaultValue) {
			var match = attributes.match(new RegExp(attributeName + "='(.*?)'\s?"));

			if (match) {
				return this._unescape(match[1]);
			} else {
				return defaultValue;
			}
		},

		/**
		 * Casts the attribute value to the correct data-type
		 *
		 * @method _castAttribute
		 * @param {string} value
		 * @param {string} type
		 * @return {*}
		 * @private
		 */
		_castAttribute: function (value, type) {

			if (value === 'null') {
				return null;
			} else if (value === 'undefined') {
				return undefined;
			}

			if (type === 'int') {
				return value * 1;
			} else if (type === 'bool') {
				return !!value;
			} else {
				return value;
			}
		}
	}
);

module.exports = TeamCityListener;



