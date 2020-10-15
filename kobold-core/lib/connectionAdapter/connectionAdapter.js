// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var Promise = require('promise');
var request = require('request');

/**
 * Abstract connection adapter
 *
 * @class ConnectionAdapter
 * @extends Base
 * @property {object} _options
 * @property {Promise} _promise
 */
var ConnectionAdapter = Base.extend(

	/**
	 * Connection adapter constructor
	 *
	 * @constructor
	 * @param {object} [options]
	 */
	function (options) {
		this.__super();

		this._options = options || {};
		this.setPromise(Promise.resolve());

		this.initialize();
	},

	/** @lends ConnectionAdapter.prototype */
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
		 * Makes a request and returns a promise
		 *
		 * @method _request
		 * @param {object} options
		 * @param {string} options.url Url of host
		 * @param {string} options.method Method of request
		 * @param {object} [options.headers] Request headers
		 * @param {string|Buffer} [options.body] Body of request
		 * @return {Promise} With {object} Response
		 * @private
		 */
		_request: function (options) {
			return new Promise(function (resolve, reject) {
				request(options, function (err, response, body) {
					if (err) {
						reject(err);
					} else {
						response.body = body;
						resolve(response);
					}
				});
			});
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
		 * Gets all bucket names
		 *
		 * @method getBuckets
		 * @param {function} [filterFn]
		 * @return {Promise} With {string[]} List of buckets
		 */
		getBuckets: function (filterFn) {
			throw new Error('Unimplemented adapter function "getBuckets".');
		},

		/**
		 * Does the instance have a specific bucket?
		 *
		 * @method hasBucket
		 * @param {string} bucket
		 * @param {function} [filterFn]
		 * @return {Promise} With {boolean} Bucket exists?
		 */
		hasBucket: function (bucket, filterFn) {
			throw new Error('Unimplemented adapter function "hasBucket".');
		},

		/**
		 * Gets all bucket keys
		 *
		 * @method getBucketKeys
		 * @param {string} bucket
		 * @param {function} [filterFn]
		 * @return {Promise} With {string[]} Bucket keys
		 */
		getBucketKeys: function (bucket, filterFn) {
			throw new Error('Unimplemented adapter function "getBucketKeys".');
		},

		/**
		 * Does the instance have a specific key in a bucket?
		 *
		 * @method hasBucketKey
		 * @param {string} bucket
		 * @param {string} key
		 * @param {function} [filterFn]
		 * @return {Promise} With {boolean} Bucket key exists?
		 */
		hasBucketKey: function (bucket, key, filterFn) {
			throw new Error('Unimplemented adapter function "hasBucketKey".');
		},

		/**
		 * Gets an object
		 *
		 * @method getObject
		 * @param {string} bucket
		 * @param {string} key
		 * @return {Promise} With {Buffer}
		 */
		getObject: function (bucket, key) {
			throw new Error('Unimplemented adapter function "getObject".');
		},

		/**
		 * Gets an object as JSON
		 *
		 * @method getObjectAsJSON
		 * @param {string} bucket
		 * @param {string} key
		 * @return {Promise} With {*}
		 */
		getObjectAsJSON: function (bucket, key) {
			throw new Error('Unimplemented adapter function "getObjectAsJSON".');
		},


		/**
		 * Sets an object
		 *
		 * @method setObject
		 * @param {string} bucket
		 * @param {string} key
		 * @param {Buffer|string} data
		 * @param {string} [mimeType='application/octet-stream']
		 * @return {Promise}
		 */
		setObject: function (bucket, key, data, mimeType) {
			throw new Error('Unimplemented adapter function "setObject".');
		},

		/**
		 * Sets an object from JSON
		 *
		 * @method setObjectFromJSON
		 * @param {string} bucket
		 * @param {string} key
		 * @param {*} data
		 * @return {Promise}
		 */
		setObjectFromJSON: function (bucket, key, data) {
			throw new Error('Unimplemented adapter function "setObjectFromJSON".');
		},


		/**
		 * Removes an object
		 *
		 * @method removeObject
		 * @param {string} bucket
		 * @param {string} key
		 * @return {Promise}
		 */
		removeObject: function (bucket, key) {
			throw new Error('Unimplemented adapter function "removeObject".');
		},

		/**
		 * Removes all object of a bucket
		 *
		 * @method removeAllObjects
		 * @param {string} bucket
		 * @return {Promise}
		 */
		removeAllObjects: function (bucket) {
			throw new Error('Unimplemented adapter function "removeAllObjects".');
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @property TYPE
		 * @type string
		 */
		TYPE: 'ConnectionAdapter'
	});

module.exports = ConnectionAdapter;
