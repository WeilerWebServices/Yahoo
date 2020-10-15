// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');
var builder = require('xmlbuilder');
var os = require('os');

/**
 * @class JUnitReporter
 * @extends AbstractReporter
 * @constructor
 */
var JUnitReporter = AbstractReporter.extend(

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
			var root = {}, output, build;

			this._createObjectTree(this.getContainer().getTree(), root);

			build = builder.create(root);
			output = build.end({pretty: true}) + "\n";

			return output;
		},

		/**
		 * Create sub-tree for xml output
		 *
		 * @method _createObjectTree
		 * @param {object} inputTreeNode
		 * @param {object} outputTreeNode
		 * @private
		 */
		_createObjectTree: function (inputTreeNode, outputTreeNode) {

			var testOutcomes = this.getContainer().gatherTestOutcomes(inputTreeNode), newNode;

			if (inputTreeNode.type === 'root') {

				// Add attributes and plain elements
				outputTreeNode.testsuites = {
					'@name': 'Tests',
					'@time': inputTreeNode.duration / 1000,
					'@tests': testOutcomes.tests,
					'@failures': testOutcomes.failed + testOutcomes.undef,
					'@disabled': testOutcomes.incomplete + testOutcomes.skipped,
					'@errors': testOutcomes.error
				};

				// Add sub-trees
				(inputTreeNode.children || []).forEach(function (child) {
					this._createObjectTree(child, outputTreeNode.testsuites);
				}.bind(this));

			} else if (inputTreeNode.type === 'suite') {

				newNode = {
					'@name': inputTreeNode.name,
					'@time': inputTreeNode.duration / 1000,
					'@tests': testOutcomes.tests,
					'@failures': testOutcomes.failed + testOutcomes.undef,
					'@disabled': testOutcomes.incomplete,
					'@skipped': testOutcomes.skipped,
					'@errors': testOutcomes.error,
					'@hostname': os.hostname(),
					'@timestamp': (new Date(inputTreeNode.startTime)).toISOString()
				};

				// Add attributes and plain elements
				if (!outputTreeNode['#list']) {
					outputTreeNode['#list'] = [];
				}
				outputTreeNode['#list'].push({testsuite: newNode});

				// Add sub-trees
				(inputTreeNode.children || []).forEach(function (child) {
					this._createObjectTree(child, newNode);
				}.bind(this));

			} else if (inputTreeNode.type === 'test') {

				newNode = {
					'@name': inputTreeNode.name, '@time': inputTreeNode.duration / 1000
				};

				if (inputTreeNode.outcome === 'skipped') {
					newNode.skipped = {
						'@type': inputTreeNode.reason, '@message': inputTreeNode.reason
					};

				} else if (inputTreeNode.outcome === 'incomplete') {
					newNode.skipped = {
						'@type': 'incomplete', '@message': 'incomplete'
					};

				} else if (inputTreeNode.outcome === 'undefined') {
					newNode.skipped = {
						'@type': 'undefined', '@message': 'undefined'
					};

				} else if (inputTreeNode.outcome === 'error') {
					newNode.error = {
						'@type': inputTreeNode.message, '@message': inputTreeNode.reason
					};

				} else if (inputTreeNode.outcome === 'failed') {
					newNode.failure = {
						'@type': inputTreeNode.message, '@message': inputTreeNode.reason
					};
				}

				// Add attributes and plain elements
				if (!outputTreeNode['#list']) {
					outputTreeNode['#list'] = [];
				}
				outputTreeNode['#list'].push({testcase: newNode});
			}
		}
	}
);

module.exports = JUnitReporter;
