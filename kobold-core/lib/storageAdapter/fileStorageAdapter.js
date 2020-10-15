// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var path = require('path');
var fs = require('fs');

var Promise = require('promise');
var PNGImage = require('pngjs-image');

var StorageAdapter = require('./storageAdapter');
var utils = require('preceptor-core').utils;


/**
 * File storage adapter
 *
 * @class FileStorageAdapter
 * @extends StorageAdapter
 * @constructor
 * @param {Object} options
 * @param {String} options.path
 * @param {String} options.approvedFolderName
 * @param {String} options.buildFolderName
 * @param {String} options.highlightFolderName
 * @param {String} options.configFolderName
 *
 * @property {string} _path
 * @property {string} _approvedFolderName
 * @property {string} _buildFolderName
 * @property {string} _highlightFolderName
 * @property {string} _configFolderName
 */
var FileStorageAdapter = StorageAdapter.extend(

	/** @lends FileStorageAdapter.prototype */
	{
		/**
		 * Initializes the source-adapter
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._path = this._options.path;

			this._approvedFolderName = this._options.approvedFolderName || 'approved';
			this._buildFolderName = this._options.buildFolderName || 'build';
			this._highlightFolderName = this._options.highlightFolderName || 'highlight';
			this._configFolderName = this._options.configFolderName || 'config';

			this.setPromise(this.getPromise().then(function () {
				this._prepareFolder();
			}.bind(this)).then(null, function (err) {
				console.log(err.stack);
			}));
		},


		/**
		 * Prepares the output folder
		 *
		 * @method _prepareFolder
		 * @private
		 */
		_prepareFolder: function () {
			var paths = [
				this._getApprovedPath(),
				this._getBuildPath(),
				this._getHighlightPath()
			];

			paths.forEach(function (path) {
				if (!fs.existsSync(path)) {
					fs.mkdirSync(path);
				}
			}.bind(this));
		},

		/**
		 * Reads an image and returns a promise
		 *
		 * @method _readImage
		 * @param {string} path
		 * @return {Promise} With {PNGImage} Image
		 * @private
		 */
		_readImage: function (path) {

			return new Promise(function (resolve, reject) {
				var image = PNGImage.readImage(path, function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(image);
					}
				});
			});
		},

		/**
		 * Writes an image and returns a promise
		 *
		 * @method _writeImage
		 * @param {string} path
		 * @param {PNGImage} image
		 * @return {Promise}
		 * @private
		 */
		_writeImage: function (path, image) {

			return new Promise(function (resolve, reject) {
				image.writeImage(path, function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		},

		/**
		 * Reads a directory an returns all files found in the folder
		 *
		 * @method _readDir
		 * @param {string} path
		 * @return {string[]}
		 * @private
		 */
		_readDir: function (path) {
			return fs.readdirSync(path);
		},

		/**
		 * Reads a directory and filters for png files, removing the extensions
		 *
		 * @method _readDirAndFilter
		 * @param {string} path
		 * @return {string[]}
		 * @private
		 */
		_readDirAndFilter: function (path) {
			var files = this._readDir(path);
			return files.filter(this._pngFilter).map(function (filename) {
				return filename.substr(0, filename.length - 4);
			});
		},

		/**
		 * List filter for png extensions
		 *
		 * @method _pngFilter
		 * @param {string} filename
		 * @return {boolean}
		 * @private
		 */
		_pngFilter: function (filename) {
			return (filename.substr(-4).toLowerCase() === '.png');
		},


		/**
		 * Gets the processing path
		 *
		 * @method _getPath
		 * @return {string}
		 * @private
		 */
		_getPath: function () {
			return this._path;
		},


		/**
		 * Is a path absolute?
		 *
		 * @param {string} pathname
		 * @return {boolean}
		 * @private
		 */
		_isPathAbsolute: function (pathname) {
			if (path.isAbsolute) {
				return path.isAbsolute(pathname);
			} else {
				return (path.resolve(pathname) == path.normalize(pathname))
			}
		},

		/**
		 * Resolves a folder-name, relative path, or absolute path given
		 *
		 * @param {string} basePath Base-path for relative paths
		 * @param {string} nameOrPath Name or path
		 * @return {string}
		 * @private
		 */
		_resolveNameOrPath: function (basePath, nameOrPath) {
			var resultPath;

			if (this._isPathAbsolute(nameOrPath)) {
				resultPath = nameOrPath;
			} else {
				resultPath = path.join(basePath, nameOrPath);
			}

			return path.resolve(resultPath);

		},

		/**
		 * Gets the approved path
		 *
		 * @method _getApprovedPath
		 * @return {string}
		 * @private
		 */
		_getApprovedPath: function () {
			return this._resolveNameOrPath(this._getPath(), this._approvedFolderName);
		},

		/**
		 * Gets the build path
		 *
		 * @method _getBuildPath
		 * @return {string}
		 * @private
		 */
		_getBuildPath: function () {
			return this._resolveNameOrPath(this._getPath(), this._buildFolderName);
		},

		/**
		 * Gets the highlight path
		 *
		 * @method _getHighlightPath
		 * @return {string}
		 * @private
		 */
		_getHighlightPath: function () {
			return this._resolveNameOrPath(this._getPath(), this._highlightFolderName);
		},

		/**
		 * Gets the config path
		 *
		 * @method _getConfigPath
		 * @return {string}
		 * @private
		 */
		_getConfigPath: function () {
			return this._resolveNameOrPath(this._getPath(), this._configFolderName);
		},


		/**
		 * Gets a list of currently approve screen names
		 *
		 * @method getCurrentApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getCurrentApprovedScreenNames: function () {
			return this.getPromise().then(function () {
				return this._readDirAndFilter(this._getApprovedPath());
			}.bind(this));
		},

		/**
		 * Gets a specific currently approved screen
		 *
		 * @method getCurrentApprovedScreen
		 * @param {string} name Name of approved screen
		 * @return {Promise} With {PNGImage} Approved screen
		 */
		getCurrentApprovedScreen: function (name) {
			return this.getPromise().then(function () {
				return this._readImage(path.join(this._getApprovedPath(), name + '.png'));
			}.bind(this));
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
			// Do nothing
			return Promise.resolve();
		},


		/**
		 * Gets a list of approved screen names
		 *
		 * @method getApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getApprovedScreenNames: function () {
			return this.getPromise().then(function () {
				return [];
			});
		},

		/**
		 * Gets a specific approved screen
		 *
		 * @method getApprovedScreen
		 * @param {string} name Name of approved screen
		 * @return {Promise} With {PNGImage} Approved screen
		 */
		getApprovedScreen: function (name) {
			return this.getPromise().then(function () {
				return undefined;
			});
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
			// Do nothing
			return Promise.resolve();
		},


		/**
		 * Gets a list of build screen names
		 *
		 * @method getBuildScreenNames
		 * @return {string[]} List of build screen names
		 * @return {Promise} With {string[]} List of build screen names
		 */
		getBuildScreenNames: function () {
			return this.getPromise().then(function () {
				return this._readDirAndFilter(this._getBuildPath());
			}.bind(this));
		},

		/**
		 * Gets a specific build screen
		 *
		 * @method getBuildScreen
		 * @param {string} name Name of build screen
		 * @return {Promise} With {PNGImage}
		 */
		getBuildScreen: function (name) {
			return this.getPromise().then(function () {
				return this._readImage(path.join(this._getBuildPath(), name + '.png'));
			}.bind(this));
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
			// Do nothing
			return Promise.resolve();
		},


		/**
		 * Gets a list of highlight screen names
		 *
		 * @method getHighlightScreenNames
		 * @return {string[]} List of highlight screen names
		 * @return {Promise} With {string[]} List of highlight screen names
		 */
		getHighlightScreenNames: function () {
			return this.getPromise().then(function () {
				return this._readDirAndFilter(this._getHighlightPath());
			}.bind(this));
		},

		/**
		 * Gets a specific highlight screen
		 *
		 * @method getHighlightScreen
		 * @param {string} name Name of highlight screen
		 * @return {Promise} With {PNGImage}
		 */
		getHighlightScreen: function (name) {
			return this.getPromise().then(function () {
				return this._readImage(path.join(this._getHighlightPath(), name + '.png'));
			}.bind(this));
		},

		/**
		 * Archives a specific highlight screen
		 *
		 * @method archiveHighlightScreen
		 * @param {string} name Name of highlight screen
		 * @param {PNGImage} image Screen to archive
		 * @return {Promise}
		 */
		archiveHighlightScreen: function (name, image) {
			return this.getPromise().then(function () {
				return this._writeImage(path.join(this._getHighlightPath(), name + '.png'), image);
			}.bind(this));
		},

		/**
		 * Gets the configuration for a specific screen
		 *
		 * @param {string} name
		 */
		getScreenConfig: function (name) {
			return this.getPromise().then(function () {
				var configPath = path.join(this._getConfigPath(), name);
				return utils.require(configPath, {});
			}.bind(this));
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @property TYPE
		 * @type string
		 */
		TYPE: 'FileStorageAdapter'
	});

module.exports = FileStorageAdapter;
