// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');

/**
 * @class TapReporter
 * @extends AbstractReporter
 * @constructor
 */
var TapReporter = AbstractReporter.extend(

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
			var tests = [],
				tree = this.getContainer().getTree(),
				numbers = this.getContainer().gatherTestOutcomes(tree);

			this._buildTestResults(tests, '', tree);

			if (tests.length === 0) {
				tests.unshift('1..0 # SKIP Nothing here!');
			} else {
				tests.unshift('1..' + tests.length);
			}

			if (numbers.tests) {
				tests.push('# tests ' + numbers.tests);
			}
			if (numbers.failed) {
				tests.push('# fail ' + numbers.failed);
			}
			if (numbers.error) {
				tests.push('# error ' + numbers.error);
			}
			if (numbers.undef) {
				tests.push('# undefined ' + numbers.undef);
			}
			if (numbers.skipped) {
				tests.push('# skipped ' + numbers.skipped);
			}
			if (numbers.incomplete) {
				tests.push('# incomplete ' + numbers.incomplete);
			}
			if (numbers.passed) {
				tests.push('# passed ' + numbers.passed);
			}

			return tests.join("\n") + "\n";
		},


		/**
		 * Escape message
		 *
		 * @method _escape
		 * @param {string} msg
		 * @return {string}
		 * @private
		 */
		_escape: function (msg) {
			return (msg + '').replace(/#/g, "").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
		},


		/**
		 * Adds a test result to the list
		 *
		 * @method _addTestResult
		 * @param {string[]} testResults
		 * @param {string} parentTitle
		 * @param {object} test
		 * @private
		 */
		_addTestResult: function (testResults, parentTitle, test) {
			var line = [];

			if (['passed', 'skipped', 'incomplete'].indexOf(test.outcome) === -1) {
				line.push('not ok');
			} else {
				line.push('ok');
			}

			line.push(testResults.length + 1);

			line.push(this._escape(parentTitle + ' ' + test.name));

			if (test.outcome === 'skipped') {
				line.push('# SKIP ' + this._escape(test.reason));
			} else if (test.outcome === 'incomplete') {
				line.push('# TODO -');
			}

			testResults.push(line.join(' '));
		},


		/**
		 * Build all test results from the node downwards
		 *
		 * @method _buildTestResults
		 * @param {string[]} testResults
		 * @param {string} parentTitle
		 * @param {object} treeNode
		 * @private
		 */
		_buildTestResults: function (testResults, parentTitle, treeNode) {

			var title;

			if (treeNode.type === 'test') {
				this._addTestResult(testResults, parentTitle, treeNode);

			} else {

				title = parentTitle + ' ' + (treeNode.name || 'Tests');

				(treeNode.children || []).forEach(function (child) {
					this._buildTestResults(testResults, title, child);
				}.bind(this));
			}
		}
	}
);

module.exports = TapReporter;
