// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class SummaryReporter
 * @extends AbstractReporter
 * @constructor
 */
var SummaryReporter = AbstractReporter.extend(

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
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {

			var tree, outcomes, begin = '', end = '';

			this.__super();

			tree = this.getContainer().getTree();
			outcomes = this.getContainer().gatherTestOutcomes(tree);

			if (this.useColor()) {
				end = '\x1B[0m';
			}

			if (outcomes.passed > 0) {
				if (this.useColor()) {
					begin = '\x1B[32m';
				}
				this.console(undefined, "stop", begin + outcomes.passed + " passed" + end + "\n");
			}
			if (outcomes.failed > 0) {
				if (this.useColor()) {
					begin = '\x1B[31m';
				}
				this.console(undefined, "stop", begin + outcomes.failed + " failed" + end + "\n");
			}
			if (outcomes.error > 0) {
				if (this.useColor()) {
					begin = '\x1B[31m';
				}
				this.console(undefined, "stop", begin + outcomes.error + " errors" + end + "\n");
			}
			if (outcomes.skipped > 0) {
				if (this.useColor()) {
					begin = '\x1B[35m';
				}
				this.console(undefined, "stop", begin + outcomes.skipped + " skipped" + end + "\n");
			}
			if (outcomes.incomplete > 0) {
				if (this.useColor()) {
					begin = '\x1B[34m';
				}
				this.console(undefined, "stop", begin + outcomes.incomplete + " incomplete" + end + "\n");
			}
			if (outcomes.undef > 0) {
				if (this.useColor()) {
					begin = '\x1B[33m';
				}
				this.console(undefined, "stop", begin + outcomes.undef + " undefined" + end + "\n");
			}

			this.console(undefined, "stop", "\n");
		}
	}
);

module.exports = SummaryReporter;
