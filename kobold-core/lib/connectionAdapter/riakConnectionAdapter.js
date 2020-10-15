// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Promise = require('promise');
var ConnectionAdapter = require('./connectionAdapter');

/**
 * Riak accessor class
 *
 * @class RiakConnectionAdapter
 * @extends ConnectionAdapter
 * @param {object} [options]
 * @param {object} [options.schema='http']
 * @param {object} [options.host='localhost']
 * @param {object} [options.port=8098]
 * @constructor
 *
 * @property {string} _schema
 * @property {string} _host
 * @property {int} _port
 */
var RiakConnectionAdapter = ConnectionAdapter.extend(

	{
		/**
		 * Initializes the source-adapter
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._schema = this._options.schema || 'http';
			this._host = this._options.host || 'localhost';
			this._port = this._options.port || 8098;
		},


		/**
		 * Gets the complete url for a path specified
		 *
		 * @method _getUrlWithPath
		 * @param {string} path
		 * @return {string}
		 * @private
		 */
		_getUrlWithPath: function (path) {
			return this._schema + '://' + this._host + ':' + this._port + path;
		},

		/**
		 * Gets all bucket names
		 *
		 * @method getBuckets
		 * @param {function} [filterFn]
		 * @return {Promise} With {string[]} List of buckets
		 */
		getBuckets: function (filterFn) {
			return this.getPromise().then(function () {
				return this._request({
					method: 'GET',
					url: this._getUrlWithPath('/buckets?buckets=true')
				}).then(function (result) {
					return JSON.parse(result.body)['buckets'];
				}).then(function (result) {
					if (filterFn) {
						return result.filter(filterFn);
					} else {
						return result;
					}
				});
			}.bind(this));
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
			return this.getBuckets(filterFn).then(function (buckets) {
				return (buckets.indexOf(bucket) !== -1);
			});
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
			return this.getPromise().then(function () {
				return this._request({
					method: 'GET',
					url: this._getUrlWithPath('/buckets/' + encodeURIComponent(bucket) + '/keys?keys=true')
				}).then(function (result) {
					return JSON.parse(result.body)['keys'];
				}).then(function (result) {
					if (filterFn) {
						return result.filter(filterFn);
					} else {
						return result;
					}
				});
			}.bind(this));
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
			return this.getBucketKeys(bucket, filterFn).then(function (keys) {
				return (keys.indexOf(key) !== -1);
			});
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
			return this.getPromise().then(function () {
				return this._request({
					method: 'GET',
					url: this._getUrlWithPath('/buckets/' + encodeURIComponent(bucket) + '/keys/' + encodeURIComponent(key))
				}).then(function (response) {
					return response.body;
				});
			}.bind(this));
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
			return this.getObject(bucket, key).then(function (result) {
				return JSON.parse(result);
			});
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
			mimeType = mimeType || 'application/octet-stream';
			return this.getPromise().then(function () {
				return this._request({
					method: 'PUT',
					url: this._getUrlWithPath('/buckets/' + encodeURIComponent(bucket) + '/keys/' + encodeURIComponent(key)),
					headers: {
						"Content-Type": mimeType
					},
					body: data
				});
			}.bind(this));
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
			return this.setObject(bucket, key, JSON.stringify(data), 'application/json');
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
			return this.getPromise().then(function () {
				return this._request({
					method: 'DELETE',
					url: this._getUrlWithPath('/buckets/' + encodeURIComponent(bucket) + '/keys/' + encodeURIComponent(key))
				});
			}.bind(this));
		},

		/**
		 * Removes all object of a bucket
		 *
		 * @method removeAllObjects
		 * @param {string} bucket
		 * @return {Promise}
		 */
		removeAllObjects: function (bucket) {
			return this.getBucketKeys(bucket).then(function (keys) {
				var i, len,
					promise = Promise.resolve();

				for (i = 0, len = keys.length; i < len; i++) {
					(function (i) {
						promise = promise.then(function () {
							return this.removeObject(bucket, keys[i]);
						}.bind(this));
					}.bind(this)(i));
				}

				return promise;
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
		TYPE: 'RiakConnectionAdapter'
	});

module.exports = RiakConnectionAdapter;
