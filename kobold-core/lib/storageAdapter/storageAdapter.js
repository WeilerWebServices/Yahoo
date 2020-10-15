// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var Promise = require('promise');

/**
 * Abstract storage adapter
 *
 * @class StorageAdapter
 * @extends Base
 * @property {object} _options
 * @property {string} _build
 * @property {Promise} _promise
 */
var StorageAdapter = Base.extend(

	/**
	 * Storage adapter constructor
	 *
	 * @constructor
	 * @param {string} build Identifier of build
	 * @param {object} [options]
	 */
	function (build, options) {
		this.__super();

		this._build = build;
		this._options = options || {};
		this.setPromise(Promise.resolve());

		this.initialize();
	},

	/** @lends StorageAdapter.prototype */
	{
		/**
		 * Initializes the source-adapter
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Nothing by default
		},


		/**
		 * Gets the options supplied on initialization
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options;
		},


		/**
		 * Gets the source-adapter promise
		 *
		 * @method getPromise
		 * @return {Promise}
		 */
		getPromise: function () {
			return this._promise;
		},

		/**
		 * Sets the promise
		 *
		 * @method setPromise
		 * @param {Promise} promise
		 */
		setPromise: function (promise) {
			this._promise = promise;
		},


		/**
		 * Gets the build information
		 *
		 * @return {string}
		 */
		getBuild: function () {
			return this._build;
		},

		/**
		 * Sets the build information
		 *
		 * @method setBuild
		 * @param {string} build
		 */
		setBuild: function (build) {
			this._build = build;
		},

		/**
		 * Gets a list of currently approve screen names
		 *
		 * @method getCurrentApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getCurrentApprovedScreenNames: function () {
			throw new Error('Unimplemented adapter function "getCurrentApprovedScreenNames".');
		},

		/**
		 * Gets a specific currently approved screen
		 *
		 * @method getCurrentApprovedScreen
		 * @param {string} name Name of approved screen
		 * @return {Promise} With {PNGImage} Approved screen
		 */
		getCurrentApprovedScreen: function (name) {
			throw new Error('Unimplemented adapter function "getCurrentApprovedScreen".');
		},

		/**
		 * Archives a specific currently approved screen
		 *
		 * @method archiveCurrentApprovedScreen
		 * @param {string} name Name of approved screen
		 * @param {PNGImage} image Screen to archive
		 * @return {Promise}
		 */
		archiveCurrentApprovedScreen: function (name, image) {
			throw new Error('Unimplemented adapter function "archiveCurrentApprovedScreen".');
		},


		/**
		 * Gets a list of approve screen names
		 *
		 * @method getApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getApprovedScreenNames: function () {
			throw new Error('Unimplemented adapter function "getApprovedScreenNames".');
		},

		/**
		 * Gets a specific approved screen
		 *
		 * @method getApprovedScreen
		 * @param {string} name Name of approved screen
		 * @return {Promise} With {PNGImage} Approved screen
		 */
		getApprovedScreen: function (name) {
			throw new Error('Unimplemented adapter function "getApprovedScreen".');
		},

		/**
		 * Archives a specific approved screen
		 *
		 * @method archiveApprovedScreen
		 * @param {string} name Name of approved screen
		 * @param {PNGImage} image Screen to archive
		 * @return {Promise}
		 */
		archiveApprovedScreen: function (name, image) {
			throw new Error('Unimplemented adapter function "archiveApprovedScreen".');
		},


		/**
		 * Gets a list of build screen names
		 *
		 * @method getBuildScreenNames
		 * @return {Promise} With {string[]} List of build screen names
		 */
		getBuildScreenNames: function () {
			throw new Error('Unimplemented adapter function "getBuildScreenNames".');
		},

		/**
		 * Gets a specific build screen
		 *
		 * @method getBuildScreen
		 * @param {string} name Name of build screen
		 * @return {Promise} With {PNGImage}
		 */
		getBuildScreen: function (name) {
			throw new Error('Unimplemented adapter function "getBuildScreen".');
		},

		/**
		 * Archives a specific build screen
		 *
		 * @method archiveBuildScreen
		 * @param {string} name Name of build screen
		 * @param {PNGImage} image Screen to archive
		 * @return {Promise}
		 */
		archiveBuildScreen: function (name, image) {
			throw new Error('Unimplemented adapter function "archiveBuildScreen".');
		},


		/**
		 * Gets a list of build highlight names
		 *
		 * @method getHighlightScreenNames
		 * @return {Promise} With {string[]} List of build screen names
		 */
		getHighlightScreenNames: function () {
			throw new Error('Unimplemented adapter function "getHighlightScreenNames".');
		},

		/**
		 * Gets a specific highlight screen
		 *
		 * @method getHighlightScreen
		 * @param {string} name Name of build screen
		 * @return {Promise} With {PNGImage} Build screen
		 */
		getHighlightScreen: function (name) {
			throw new Error('Unimplemented adapter function "getHighlightScreen".');
		},

		/**
		 * Archives a specific highlight screen
		 *
		 * @method archiveHighlightScreen
		 * @param {string} name Name of highlight screen
		 * @param {PNGImage} image Screen to archive
		 */
		archiveHighlightScreen: function (name, image) {
			throw new Error('Unimplemented adapter function "archiveHighlightScreen".');
		},

		/**
		 * Gets the configuration for a specific screen
		 *
		 * @param {string} name
		 */
		getScreenConfig: function (name) {
			throw new Error('Unimplemented adapter function "getScreenConfig".');
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @property TYPE
		 * @type string
		 */
		TYPE: 'StorageAdapter'
	});

module.exports = StorageAdapter;
