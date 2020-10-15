// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var glob = require('glob');
var Promise = require('promise');
var EventReporter = require('./reporter/event');

var defaultsLoader = require('./defaults/loader');

/**
 * @class AbstractLoader
 * @extends Base
 *
 * @property {object} _options
 * @property {EventReporter} _reporter
 * @property {int} _id
 */
var AbstractLoader = Base.extend(

	/**
	 * Abstract loader constructor
	 *
	 * @param {object} options
	 * @constructor
	 */
	function (options) {
		this.__super();

		this._options = utils.deepExtend({}, [defaultsLoader, options || {}]);
		this._reporter = new EventReporter();

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {

			this._id = +(new Date()) + Math.floor(Math.random() * 100000);

			this.getReporter().on('message', function (areaType, messageType, params) {
				this.emit('message', areaType, messageType, params);
			}.bind(this));
		},


		/**
		 * Create a new id
		 *
		 * @method newId
		 * @return {int}
		 */
		newId: function () {
			return this._id++;
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
		 * Output path
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getOptions().path;
		},

		/**
		 * Gets the reporter instance
		 *
		 * @method getReporter
		 * @return {EventReporter}
		 */
		getReporter: function () {
			return this._reporter;
		},


		/**
		 * Sends the coverage data to parent for merging
		 *
		 * @method coverage
		 * @param {object} cov
		 */
		coverage: function (cov) {
			this.emit('coverage', cov);
		},


		/**
		 * Starts the loading process
		 *
		 * @method process
		 * @param {string} parentId
		 * @return {Promise}
		 */
		process: function (parentId) {
			var files = this._gatherFiles();
			return this._processFiles(parentId, files);
		},


		/**
		 * Gathers all files that is selected by the glob
		 *
		 * @method _gatherFiles
		 * @return {string[]}
		 * @private
		 */
		_gatherFiles: function () {
			return glob.sync(this.getPath());
		},

		/**
		 * Processes a list of files
		 *
		 * @method _processFiles
		 * @param {string} parentId
		 * @param {string[]} files
		 * @return {Promise}
		 * @private
		 */
		_processFiles: function (parentId, files) {

			var promise = Promise.resolve();

			files.forEach(function (file) {
				promise = promise.then(function () {
					return this._processFile(parentId, file);
				}.bind(this));
			}, this);

			return promise.then(null, function (err) {
				console.err(err.stack);
			});
		},

		/**
		 * Processes a single file
		 *
		 * @method _processFile
		 * @param {string} parentId
		 * @param {string} file
		 * @return {Promise}
		 * @private
		 */
		_processFile: function (parentId, file) {
			throw new Error('Unimplemented loader method "_processFile".');
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractLoader'
	}
);

module.exports = AbstractLoader;
