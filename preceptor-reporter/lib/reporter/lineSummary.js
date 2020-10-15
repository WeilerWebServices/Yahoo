// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class LineSummaryReporter
 * @extends AbstractReporter
 * @constructor
 */
var LineSummaryReporter = AbstractReporter.extend(

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

			var outcomes, failed, tree;

			this.__super();

			tree = this.getContainer().getTree();
			outcomes = this.getContainer().gatherTestOutcomes(tree);
			failed = (outcomes.error + outcomes.failed) > 0;

			if (this.useColor()) {
				if (failed) {
					this.console(undefined, "stop", '\x1B[41m\x1B[37m');
				} else {
					this.console(undefined, "stop", '\x1B[42m');
				}
			}

			this.console(undefined, "stop", (failed ? 'Failed' : 'Success') + " (");
			this.console(undefined, "stop", outcomes.tests + " tests");

			if (outcomes.passed > 0) {
				this.console(undefined, "stop", ", " + outcomes.passed + " passed");
			}
			if (outcomes.failed > 0) {
				this.console(undefined, "stop", ", " + outcomes.failed + " failed");
			}
			if (outcomes.error > 0) {
				this.console(undefined, "stop", ", " + outcomes.error + " errors");
			}
			if (outcomes.skipped > 0) {
				this.console(undefined, "stop", ", " + outcomes.skipped + " skipped");
			}
			if (outcomes.incomplete > 0) {
				this.console(undefined, "stop", ", " + outcomes.incomplete + " incomplete");
			}
			if (outcomes.undef > 0) {
				this.console(undefined, "stop", ", " + outcomes.undef + " undefined");
			}
			this.console(undefined, "stop", ")");

			if (this.useColor()) {
				this.console(undefined, "stop", '\x1B[0m');
			}

			this.console(undefined, "stop", "\n\n");
		}
	}
);

module.exports = LineSummaryReporter;
