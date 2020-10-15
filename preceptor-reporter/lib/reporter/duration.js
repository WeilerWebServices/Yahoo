// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class DurationReporter
 * @extends AbstractReporter
 * @constructor
 */
var DurationReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			var options;

			this.__super();

			options = this.getOptions();
			if (options.progress === undefined) {
				options.progress = false;
			}
			if (options.output === undefined) {
				options.output = true;
			}
		},


		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			var time, tree;

			this.__super();

			tree = this.getContainer().getTree();

			time = tree.duration;
			if (time <= 1000) { // <= 1 seconds
				time += " milliseconds";

			} else if (time < 120000) { // < 2 minutes
				time = (time / 1000) + " seconds";

			} else { // in minutes
				time = (Math.floor(time / 1000) / 60) + " minutes";
			}

			// Log to root entry
			this.console(undefined, "stop", "Time: " + time + "\n\n");
		}
	}
);

module.exports = DurationReporter;
