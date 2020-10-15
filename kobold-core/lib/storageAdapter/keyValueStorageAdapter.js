// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Promise = require('promise');
var uuid = require('uuid');
var PNGImage = require('pngjs-image');

var StorageAdapter = require('./storageAdapter');

/**
 * Key-Value storage adapter
 *
 * @class KeyValueStorageAdapter
 * @extends StorageAdapter
 * @constructor
 * @param {object} options
 * @param {ConnectionAdapter} options.connection
 * @param {string} options.company
 * @param {string} options.department
 * @param {string} options.project
 * @param {string} options.job
 *
 * @property {ConnectionAdapter} _connection
 * @property {string} _company
 * @property {object} _companyInfo
 * @property {string} _department
 * @property {object} _departmentInfo
 * @property {string} _project
 * @property {object} _projectInfo
 * @property {string} _job
 * @property {object} _jobInfo
 * @property {object} _buildInfo
 */
var KeyValueStorageAdapter = StorageAdapter.extend(

	/** @lends KeyValueStorageAdapter.prototype */
	{
		/**
		 * Initializes the source-adapter
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._connection = this._options.connection;
			this._company = this._options.company;
			this._department = this._options.department;
			this._project = this._options.project;
			this._job = this._options.job;

			this.setPromise(this._prepareCompanyBucket());
			this.setPromise(this._prepareDepartmentBucket());
			this.setPromise(this._prepareProjectBucket());
			this.setPromise(this._prepareJobBucket());
			this.setPromise(this._prepareBuildBucket());
		},


		/**
		 * Prepare a bucket
		 *
		 * @method _prepareBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareBucket: function (bucketName, key, initialValue, failWhenExist) {

			return this.getPromise().then(function () {

				return this._connection.hasBucket(bucketName).then(function (hasBucket) {

					if (!hasBucket) {
						throw new Error('The ' + bucketName + ' bucket is not available in the key-value instance.');
					}
				});

			}.bind(this)).then(function () {

				return this._connection.hasBucketKey(bucketName, key, this._bucketKeyFilter).then(function (hasBucketKey) {

					if (hasBucketKey) {
						if (failWhenExist) {
							throw new Error('The ' + bucketName + ' bucket with key ' + key + ' is already available in the key-value instance.');
						}
					} else {
						return this._connection.setObjectFromJSON(bucketName, key, initialValue);
					}
				}.bind(this));

			}.bind(this));
		},


		/**
		 * Prepare the companies bucket
		 *
		 * @method _prepareCompanyBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareCompanyBucket: function () {
			var id = 'company_' + uuid.v4();
			return this._prepareBucket('companies', this._company, {
				id: id
			}).then(function () {
				return this._connection.getObjectAsJSON('companies', this._company).then(function (info) {
					this._companyInfo = info;
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Prepare the departments bucket
		 *
		 * @method _prepareDepartmentBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareDepartmentBucket: function () {
			var id = 'department_' + uuid.v4();
			return this._prepareBucket('departments', this._department, {
				id: id
			}).then(function () {
				return this._connection.getObjectAsJSON('departments', this._department).then(function (info) {
					this._departmentInfo = info;
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Prepare the projects bucket
		 *
		 * @method _prepareProjectBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareProjectBucket: function () {
			var id = 'project_' + uuid.v4();
			return this._prepareBucket('projects', this._project, {
				id: id
			}).then(function () {
				return this._connection.getObjectAsJSON('projects', this._project).then(function (info) {
					this._projectInfo = info;
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Prepare the jobs bucket
		 *
		 * @method _prepareJobBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareJobBucket: function () {
			var id = 'job_' + uuid.v4();
			return this._prepareBucket('jobs', this._job, {
				id: id,
				approvedScreensBucket: this._getCurrentApprovedScreenBucket(id)
			}).then(function () {
				return this._connection.getObjectAsJSON('jobs', this._job).then(function (info) {
					this._jobInfo = info;
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Prepare the build bucket
		 *
		 * @method _prepareBuildBucket
		 * @return {Promise}
		 * @private
		 */
		_prepareBuildBucket: function () {
			var id = 'build_' + uuid.v4();
			this._buildInfo = {
				id: id,
				creationTime: +(new Date()),
				approvedScreensBucket: this._getApprovedScreenBucket(id),
				highlightScreensBucket: this._getHighlightScreenBucket(id),
				buildScreensBucket: this._getBuildScreenBucket(id)
			};
			return this._prepareBucket('builds', this._build, this._buildInfo, true);
		},


		/**
		 * Loads an image blob and returns a promise for it
		 *
		 * @method _loadImage
		 * @param {Buffer} blob
		 * @return {Promise} With {PNGImage} Image
		 * @private
		 */
		_loadImage: function (blob) {
			return new Promise(function (resolve, reject) {
				PNGImage.loadImage(blob, function (err, image) {
					if (err) {
						reject(err);
					} else {
						resolve(image);
					}
				});
			})
		},

		/**
		 * Saves an image to a blob and returns a promise for it
		 *
		 * @method _blobImage
		 * @param {PNGImage} image
		 * @return {Promise} With {Buffer} Blob
		 * @private
		 */
		_blobImage: function (image) {
			return new Promise(function (resolve, reject) {
				image.toBlob(function (err, blob) {
					if (err) {
						reject(err);
					} else {
						resolve(blob);
					}
				});
			})
		},


		/**
		 * Gets the current approved-screen bucket
		 *
		 * @method _getCurrentApprovedScreenBucket
		 * @param {string} [id]
		 * @return {string}
		 * @private
		 */
		_getCurrentApprovedScreenBucket: function (id) {
			return (id || this._jobInfo.id) + '_approved';
		},

		/**
		 * Gets the approved-screen bucket
		 *
		 * @method _getApprovedScreenBucket
		 * @param {string} [id]
		 * @return {string}
		 * @private
		 */
		_getApprovedScreenBucket: function (id) {
			return (id || this._buildInfo.id) + '_approved';
		},

		/**
		 * Gets the highlight-screen bucket
		 *
		 * @method _getHighlightScreenBucket
		 * @param {string} [id]
		 * @return {string}
		 * @private
		 */
		_getHighlightScreenBucket: function (id) {
			return (id || this._buildInfo.id) + '_highlight';
		},

		/**
		 * Gets the build-screen bucket
		 *
		 * @method _getBuildScreenBucket
		 * @param {string} [id]
		 * @return {string}
		 * @private
		 */
		_getBuildScreenBucket: function (id) {
			return (id || this._buildInfo.id) + '_build';
		},


		/**
		 * Key filter for bucket keys
		 *
		 * @method _bucketKeyFilter
		 * @param {string} key
		 * @return {boolean}
		 * @private
		 */
		_bucketKeyFilter: function (key) {
			return (key.substr(0, 1) !== '_');
		},


		/**
		 * Gets a list of currently approve screen names
		 *
		 * @method getCurrentApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getCurrentApprovedScreenNames: function () {
			return this.getPromise().then(function () {
				return this._connection.getBucketKeys(this._getCurrentApprovedScreenBucket());
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
				return this._connection.getObject(this._getCurrentApprovedScreenBucket(), name);
			}.bind(this)).then(function (blob) {
				return this._loadImage(blob);
			});
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
			return this.getPromise().then(function () {
				return this._blobImage(image);
			}.bind(this)).then(function (blob) {
				return this._connection.setObject(this._getCurrentApprovedScreenBucket(), name, blob, 'image/png');
			}.bind(this));
		},


		/**
		 * Gets a list of approve screen names
		 *
		 * @method getApprovedScreenNames
		 * @return {Promise} With {string[]} List of approved screen names
		 */
		getApprovedScreenNames: function () {
			return this.getPromise().then(function () {
				return this._connection.getBucketKeys(this._getApprovedScreenBucket());
			}.bind(this));
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
				return this._connection.getObject(this._getApprovedScreenBucket(), name);
			}.bind(this)).then(function (blob) {
				return this._loadImage(blob);
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
			return this.getPromise().then(function () {
				return this._blobImage(image);
			}.bind(this)).then(function (blob) {
				return this._connection.setObject(this._getApprovedScreenBucket(), name, blob, 'image/png');
			}.bind(this));
		},


		/**
		 * Gets a list of build screen names
		 *
		 * @method getBuildScreenNames
		 * @return {Promise} With {string[]} List of build screen names
		 */
		getBuildScreenNames: function () {
			return this.getPromise().then(function () {
				return this._connection.getBucketKeys(this._getBuildScreenBucket());
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
				return this._connection.getObject(this._getBuildScreenBucket(), name);
			}.bind(this)).then(function (blob) {
				return this._loadImage(blob);
			});
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
			return this.getPromise().then(function () {
				return this._blobImage(image);
			}.bind(this)).then(function (blob) {
				return this._connection.setObject(this._getBuildScreenBucket(), name, blob, 'image/png');
			}.bind(this));
		},


		/**
		 * Gets a list of build highlight names
		 *
		 * @method getHighlightScreenNames
		 * @return {Promise} With {string[]} List of build screen names
		 */
		getHighlightScreenNames: function () {
			return this.getPromise().then(function () {
				return this._connection.getBucketKeys(this._getHighlightScreenBucket());
			}.bind(this));
		},

		/**
		 * Gets a specific highlight screen
		 *
		 * @method getHighlightScreen
		 * @param {string} name Name of build screen
		 * @return {Promise} With {PNGImage} Build screen
		 */
		getHighlightScreen: function (name) {
			return this.getPromise().then(function () {
				return this._connection.getObject(this._getHighlightScreenBucket(), name);
			}.bind(this)).then(function (blob) {
				return this._loadImage(blob);
			});
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
				return this._blobImage(image);
			}.bind(this)).then(function (blob) {
				return this._connection.setObject(this._getHighlightScreenBucket(), name, blob, 'image/png');
			}.bind(this));
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
		TYPE: 'KeyValueStorageAdapter'
	});

module.exports = KeyValueStorageAdapter;
