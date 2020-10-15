// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractListener = require('../abstractListener');

/**
 * @class PreceptorListener
 * @extends AbstractListener
 * @constructor
 */
var PreceptorListener = AbstractListener.extend(

	{
		/**
		 * Gets a list of relayed messages
		 *
		 * @method getRelayedMessages
		 * @return {string[]}
		 */
		getRelayedMessages: function () {
			return [
				'itemData',
				'itemMessage',
				'suiteStart',
				'suiteEnd',
				'testStart',
				'testFailed',
				'testUndefined',
				'testError',
				'testPassed',
				'testSkipped',
				'testIncomplete'
			];
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
				messageTypes = this.getRelayedMessages(),
				match = true,
				localText = text;

			while (match) {

				match = localText.match(/^#\|#\s(\w*?)\s(.*?)\s#\|#$/m);

				if (match) {
					messageType = match[1];
					data = match[2];

					// Remove data from stream
					localText = localText.replace(match[0] + "\n", "");

					if (messageTypes.indexOf(messageType) !== -1) {

						data = this.processPlaceholder(data, placeholder);
						data = JSON.parse(data);

						this.triggerMessage(messageType, data);
					}
				}
			}

			return localText;
		}
	}
);

module.exports = PreceptorListener;



