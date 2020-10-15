// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var fs = require('fs');

var defaultsReporter = require('./defaults/reporter');

/**
 * @class AbstractReporter
 * @extends Base
 *
 * @property {ReportContainer} _container
 * @property {object} _options
 */
var AbstractReporter = Base.extend(

	/**
	 * Abstract reporter constructor
	 *
	 * @param {ReportContainer} container
	 * @param {object} options
	 * @constructor
	 */
	function (container, options) {
		this.__super();

		this._container = container;
		this._options = utils.deepExtend({}, [defaultsReporter, options || {}]);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Do nothing!
		},


		/**
		 * Gets the options
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options || {};
		},

		/**
		 * Gets the type of reporter
		 *
		 * @method getType
		 * @return {string}
		 */
		getType: function () {
			return this.getOptions().type;
		},

		/**
		 * Gets the configuration supplied
		 *
		 * @method getConfiguration
		 * @return {object}
		 */
		getConfiguration: function () {
			return this.getOptions().configuration || {};
		},

		/**
		 * Gets the container
		 *
		 * @method getContainer
		 * @return {ReportContainer}
		 */
		getContainer: function () {
			return this._container;
		},

		/**
		 * Output path
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getOptions().path;
		},

		/**
		 * Should reporter use color?
		 *
		 * @method useColor
		 * @return {boolean}
		 */
		useColor: function () {
			return !!this.getOptions().color;
		},

		/**
		 * Should the reporter output the data?
		 *
		 * @method shouldOutput
		 * @return {boolean}
		 */
		shouldOutput: function () {
			return !!this.getOptions().output;
		},

		/**
		 * Should the reporter show progress?
		 *
		 * @method shouldShowProgress
		 * @return {boolean}
		 */
		shouldShowProgress: function () {
			return !!this.getOptions().progress;
		},


		/**
		 * Sends message to the console
		 *
		 * @method console
		 * @param {string} id
		 * @param {string} msgType
		 * @param {string} msg
		 */
		console: function (id, msgType, msg) {
			var type = this.getType(),
				action;

			action = this.getContainer().getAction(id);

			if (!action.output[msgType]) {
				action.output[msgType] = {};
			}
			if (!action.output[msgType][type]) {
				action.output[msgType][type] = [];
			}
			action.output[msgType][type].push(msg);

			if (this.shouldOutput() && this.shouldShowProgress()) {
				this.output(msg);
			}
		},

		/**
		 * Outputs data to stdout
		 *
		 * @method output
		 * @param {string} data
		 */
		output: function (data) {
			process.stdout.write(data);
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			// Do nothing
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			// Do nothing
		},


		/**
		 * Reporting is completed
		 *
		 * @method complete
		 */
		complete: function () {
			var output;

			if (this.shouldOutput() && !this.shouldShowProgress()) {

				output = this.getOutput();
				if (output.length > 0) {
					this.output(output);
				}
			}

			this.write();
		},


		/**
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			// Do nothing
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			// Do nothing
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			// Do nothing
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			// Do nothing
		},


		/**
		 * Called when test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 */
		testStart: function (id, parentId, testName) {
			// Do nothing
		},


		/**
		 * Called when test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testFailed: function (id, message, reason) {
			// Do nothing
		},

		/**
		 * Called when test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testError: function (id, message, reason) {
			// Do nothing
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			// Do nothing
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			// Do nothing
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			// Do nothing
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			// Do nothing
		},


		/**
		 * Gets the collected output
		 *
		 * @method getOutput
		 * @return {string}
		 */
		getOutput: function () {

			var container = this.getContainer(),
				type = this.getType(),
				actionIds = this._gatherNodesFromTree(),
				output = [];

			actionIds.forEach(function (id) {
				var action, types;

				action = container.getAction(id[0]);
				types = action.output[id[1]];
				if (types) {
					output = output.concat(types[type] || []);
				}

			}, this);

			return output.join('');
		},

		/**
		 * Gathers the nodes from the tree in-order
		 *
		 * @method _gatherNodesFromTree
		 * @return {object[]}
		 * @private
		 */
		_gatherNodesFromTree: function () {

			var container = this.getContainer(),
				actionIds = [],
				fn;

			actionIds.push([undefined, AbstractReporter.REPORT_START]);
			fn = function (children) {
				children.forEach(function (child) {
					actionIds.push([child.id, AbstractReporter.ENTRY_START]);
					if (child.children) {
						fn(child.children);
					}
					actionIds.push([child.id, AbstractReporter.ENTRY_END]);
				});
			};
			fn(container.getTree().children);
			actionIds.push([undefined, AbstractReporter.REPORT_STOP]);
			actionIds.push([undefined, AbstractReporter.REPORT_COMPLETE]);

			return actionIds;
		},


		/**
		 * Exports data to a string
		 *
		 * @method toString
		 * @return {string}
		 */
		toString: function () {
			return this.getOutput();
		},

		/**
		 * Writes the data into an output file
		 *
		 * @method write
		 */
		write: function () {
			var path = this.getPath();
			if (path) {
				this._writeToFile(path, this.getOutput());
			}
		},

		/**
		 * Write data to the filesystem
		 *
		 * @method _writeToFile
		 * @param {string} path
		 * @param {string} output
		 * @private
		 */
		_writeToFile: function (path, output) {
			fs.writeFileSync(path, output);
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractReporter',


		/**
		 * Used to signal start of report entry
		 *
		 * @property ENTRY_START
		 * @type {string}
		 * @static
		 */
		ENTRY_START: 'start',

		/**
		 * Used to signal end of report entry
		 *
		 * @property ENTRY_END
		 * @type {string}
		 * @static
		 */
		ENTRY_END: 'end',


		/**
		 * Used to signal start of report
		 *
		 * @property REPORT_START
		 * @type {string}
		 * @static
		 */
		REPORT_START: 'start',

		/**
		 * Used to signal end of report
		 *
		 * @property REPORT_STOP
		 * @type {string}
		 * @static
		 */
		REPORT_STOP: 'stop',

		/**
		 * Used to signal completion of report
		 *
		 * @property REPORT_COMPLETE
		 * @type {string}
		 * @static
		 */
		REPORT_COMPLETE: 'complete'
	}
);

module.exports = AbstractReporter;
