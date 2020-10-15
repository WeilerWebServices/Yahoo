// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractLoader = require('../abstractLoader');
var fs = require('fs');
var Promise = require('promise');
var _ = require('underscore');

/**
 * @class IstanbulLoader
 * @extends AbstractLoader
 * @constructor
 */
var IstanbulLoader = AbstractLoader.extend(

	{
		/**
		 * Has mapping turned on?
		 *
		 * @method hasMapping
		 * @return {string}
		 */
		hasMapping: function () {
			return !!this.getConfiguration().mapping;
		},

		/**
		 * Get mapping
		 *
		 * @method getMapping
		 * @return {object[]} Of `{from:<string>, to:<string>}`
		 */
		getMapping: function () {
			return this.getConfiguration().mapping;
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

			return new Promise(function (resolve, reject) {

				fs.readFile(file, function (err, data) {

					var cov;

					if (err) {
						reject(err);

					} else {
						cov = data.toString('utf8');
						cov = JSON.parse(cov);

						// Mapping
						if (this.hasMapping()) {
							cov = this._mapCoverage(cov, this.getMapping());
						}

						this.coverage(cov);
						resolve(cov);
					}

				}.bind(this));
			}.bind(this));
		},

		/**
		 * Maps coverage paths to a new path
		 *
		 * @param {object} coverage
		 * @param {object[]} mappingList
		 * @returns {object}
		 * @private
		 */
		_mapCoverage: function (coverage, mappingList) {
			var keys = _.keys(coverage), result = {};

			keys.forEach(function (key) {
				var path = key;

				// Update paths
				(mappingList || []).forEach(function (mapping) {
					path = path.replace(new RegExp(mapping.from), mapping.to);
				});

				// Copy coverage
				result[path] = coverage[key];

				// Replace path in child
				if (result[path].path) {
					result[path].path = path;
				}
			});

			return result;
		}
	}
);

module.exports = IstanbulLoader;
