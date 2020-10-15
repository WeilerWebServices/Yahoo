// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class JsonReporter
 * @extends AbstractReporter
 * @constructor
 */
var JsonReporter = AbstractReporter.extend(

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
				this.getOptions().output = false;
			}
		},


		/**
		 * Gets the collected output
		 *
		 * @method getOutput
		 * @return {string}
		 */
		getOutput: function () {
			return JSON.stringify(this.getContainer().getTree(), null, 4) + "\n";
		}
	}
);

module.exports = JsonReporter;
