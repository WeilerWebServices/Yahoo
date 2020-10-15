// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var _ = require('underscore');

/**
 * This class manages the messages received and is used as data-source for the reporter instances.
 *
 * @class ReportContainer
 * @extends Base
 *
 * @property {object[]} _sequence Sequence of items in the report
 * @property {object} _actions Actions for each item keyed by the id - used for direct access into the tree
 * @property {object} _tree Root object of reporting tree - uses references from _actions to form tree
 */
var ReportContainer = Base.extend(

	{
		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			this._sequence = [];
			this._actions = {};
			this._tree = {
				startTime: +(new Date()),
				pending: true,
				type: 'root',
				name: 'Root',
				level: 0,
				data: {},
				messages: [],
				children: [],
				output: {}
			};
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {

			this._tree.endTime = +(new Date());
			this._tree.duration = this._tree.endTime - this._tree.startTime;
			this._tree.pending = false;

			_.keys(this._actions).forEach(function (id) {

				var action = this._actions[id];

				if (action.pending) {
					throw new Error("Reporter action '" + action.type + "' for '" + action.name + "' is pending when end was reached.");
				}
			}, this);
		},

		/**
		 * Reporting is completed
		 *
		 * @method complete
		 */
		complete: function () {
			// Nothing here
		},

		/**
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 * @param {object} [options]
		 * @param {int} [options.startTime]
		 */
		suiteStart: function (id, parentId, suiteName, options) {
			var parent;

			options = options || {};

			this._actions[id] = {
				id: id,
				startTime: options.startTime || +(new Date()),
				pending: true,
				type: 'suite',
				name: suiteName,
				data: {},
				messages: [],
				parentId: parentId,
				children: [],
				output: {}
			};

			parent = this.getAction(parentId);
			this._actions[id].level = parent.level + 1;

			this._sequence.push(this._actions[id]);
			parent.children.push(this._actions[id]);
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 * @param {object} [options]
		 * @param {int} [options.endTime]
		 */
		suiteEnd: function (id, options) {
			var action = this.getAction(id);

			options = options || {};

			if (action.type !== 'suite') {
				throw new Error("Type of reporter action was expected to be 'suite' but was '" + action.type + "'.");
			}
			if (!action.pending) {
				throw new Error("Reporter action for suite was already closed.");
			}

			action.endTime = options.startTime || +(new Date());
			action.duration = action.endTime - action.startTime;
			action.pending = false;
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			var action = this.getAction(id);

			action.data = utils.deepExtend(action.data, [JSON.parse(json)]);
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			this.getAction(id).messages.push(message);
		},


		/**
		 * Called when test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 * @param {object} [options]
		 * @param {int} [options.startTime]
		 */
		testStart: function (id, parentId, testName, options) {
			var parent;

			options = options || {};

			this._actions[id] = {
				id: id,
				startTime: options.startTime || +(new Date()),
				pending: true,
				type: 'test',
				name: testName,
				data: {},
				messages: [],
				parentId: parentId,
				output: {}
			};

			parent = this.getAction(parentId);
			this._actions[id].level = parent.level + 1;

			this._sequence.push(this._actions[id]);
			parent.children.push(this._actions[id]);
		},


		/**
		 * Called when test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 * @param {object} [options]
		 * @param {int} [options.endTime]
		 */
		testFailed: function (id, message, reason, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'failed';
			action.message = message || 'FAILED';
			action.reason = reason || action.message;
		},

		/**
		 * Called when test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 * @param {object} [options]
		 */
		testError: function (id, message, reason, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'error';
			action.message = message || 'ERROR';
			action.reason = reason || action.message;
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 * @param {object} [options]
		 */
		testPassed: function (id, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'passed';
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 * @param {object} [options]
		 */
		testUndefined: function (id, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'undefined';
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 * @param {object} [options]
		 */
		testSkipped: function (id, reason, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'skipped';
			action.reason = reason || 'SKIPPED';
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 * @param {object} [options]
		 */
		testIncomplete: function (id, options) {
			var action = this._completeTestAction(id, options);

			action.outcome = 'incomplete';
		},


		/**
		 * Completes a test
		 *
		 * @method _completeTestAction
		 * @param {string} id
		 * @param {object} [options]
		 * @param {int} [options.endTime]
		 * @return {object} Action
		 * @private
		 */
		_completeTestAction: function (id, options) {
			var action = this.getAction(id);

			options = options || {};

			if (action.type !== 'test') {
				throw new Error("Type of reporter action was expected to be 'test' but was '" + action.type + "'.");
			}
			if (!action.pending) {
				throw new Error("Reporter action for test was already closed.");
			}

			action.endTime = options.endTime || +(new Date());
			action.duration = action.endTime - action.startTime;
			action.pending = false;

			return action;
		},


		/**
		 * Gets action by id
		 *
		 * @method getAction
		 * @param {string} id
		 * @return {object}
		 */
		getAction: function (id) {
			var action;

			if (id === "undefined") {
				id = undefined;
			}
			if (id === "null") {
				id = null;
			}

			if ((id === undefined) || (id === null)) {
				action = this.getTree();
			} else {
				action = this._actions[id];

				if (!action) {
					throw new Error("Id for reporter action doesn't exist " + id + ".");
				}
			}

			return action;
		},

		/**
		 * Gets the sequence of actions by the sequential list of ids
		 *
		 * @method getSequence
		 * @return {string[]}
		 */
		getSequence: function () {
			return this._sequence || [];
		},

		/**
		 * Gets the action tree
		 *
		 * @method getTree
		 * @return {object}
		 */
		getTree: function () {
			return this._tree || {};
		},


		/**
		 * Gathers all test outcomes for a node
		 *
		 * @method gatherTestOutcomes
		 * @param {object} treeNode
		 * @return {object} Of `{tests: int, failed: int, disabled: int, error: int}`
		 */
		gatherTestOutcomes: function (treeNode) {
			var result = {
				tests: 0, failed: 0, incomplete: 0, skipped: 0, error: 0, passed: 0, undef: 0
			};

			this._countOutcomes(treeNode, result);

			return result;
		},

		/**
		 * Counts a specific outcome downwards from the current tree-point
		 *
		 * @method _countOutcomes
		 * @param {object} treeNode
		 * @param {object} sumObj
		 * @private
		 */
		_countOutcomes: function (treeNode, sumObj) {
			if (treeNode.type === 'test') {
				sumObj.tests++;

				if (treeNode.outcome === 'undefined') {
					sumObj.undef++;
				} else {
					sumObj[treeNode.outcome]++;
				}
			} else {
				(treeNode.children || []).forEach(function (node) {
					this._countOutcomes(node, sumObj);
				}, this);
			}
		},

		/**
		 * Gets the full name of an object
		 *
		 * @method getFullName
		 * @param {string} id
		 * @return {string}
		 */
		getFullName: function (id) {
			var action = this.getAction(id), parentId = action.parentId, name = action.name;

			if (parentId !== undefined) {
				return [this.getFullName(parentId), name].join(" ");
			} else {
				return name;
			}
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'ReportContainer'
	}
);

module.exports = ReportContainer;
