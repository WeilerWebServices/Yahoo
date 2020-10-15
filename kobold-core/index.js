// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

/**
 * Exported values
 *
 * @type {object}
 */
var core = {

	/**
	 * Abstract comparison adapter class
	 *
	 * @property ComparisonAdapter
	 * @type {ComparisonAdapter}
	 */
	ComparisonAdapter: require('./lib/comparisonAdapter/comparisonAdapter'),

	/**
	 * List of comparison adapters
	 *
	 * @property comparisonAdapters
	 * @type {object}
	 */
	comparisonAdapters: {
		"blinkdiff": require('./lib/comparisonAdapter/blinkDiffAdapter'),
		"perceptualdiff": require('./lib/comparisonAdapter/perceptualDiffAdapter'),
		"shell": require('./lib/comparisonAdapter/shellAdapter')
	},

	/**
	 * Builds a comparison adapter
	 *
	 * @method buildComparisonAdapter
	 * @param {object} config
	 * @param {string} config.type
	 * @param {object} [config.options]
	 * @return {ComparisonAdapter}
	 */
	buildComparisonAdapter: function (config) {
		var type = config.type,
			adapterOptions = config.options || {},
			AdapterClass;

		if (typeof type == 'string') {
			AdapterClass = core.comparisonAdapters[type.toLowerCase()];
			return new AdapterClass(adapterOptions);
		} else {
			return type; // Use as instance instead
		}
	},


	/**
	 * Abstract storage adapter class
	 *
	 * @property StorageAdapter
	 * @type {StorageAdapter}
	 */
	StorageAdapter: require('./lib/storageAdapter/storageAdapter'),

	/**
	 * List of storage adapters
	 *
	 * @property storageAdapters
	 * @type {object}
	 */
	storageAdapters: {
		"file": require('./lib/storageAdapter/fileStorageAdapter'),
		"keyvalue": require('./lib/storageAdapter/keyValueStorageAdapter')
	},

	/**
	 * Builds a storage adapter
	 *
	 * @method buildStorageAdapter
	 * @param {string} build
	 * @param {object} config
	 * @param {string} config.type
	 * @param {object} [config.options]
	 * @param {ConnectionAdapter} [config.connection]
	 * @return {StorageAdapter}
	 */
	buildStorageAdapter: function (build, config) {
		var type = config.type,
			adapterOptions = config.options || {},
			AdapterClass;

		if (typeof type == 'string') {
			AdapterClass = core.storageAdapters[type.toLowerCase()];
			if (config.connection) {
				adapterOptions.connection = this.buildConnectionAdapter(config.connection);
			}
			return new AdapterClass(build, adapterOptions);
		} else {
			return type; // Use as instance instead
		}
	},


	/**
	 * Abstract connection adapter class
	 *
	 * @property ConnectionAdapter
	 * @type {ConnectionAdapter}
	 */
	ConnectionAdapter: require('./lib/connectionAdapter/connectionAdapter'),

	/**
	 * List of connection adapters
	 *
	 * @property connectionAdapters
	 * @type {object}
	 */
	connectionAdapters: {
		"riak": require('./lib/connectionAdapter/riakConnectionAdapter')
	},

	/**
	 * Builds a connection adapter
	 *
	 * @method buildConnectionAdapter
	 * @param {object} config
	 * @param {string} config.type
	 * @param {object} [config.options]
	 * @return {ConnectionAdapter}
	 */
	buildConnectionAdapter: function (config) {
		var type = config.type,
			adapterOptions = config.options,
			AdapterClass;

		if (typeof type == 'string') {
			AdapterClass = core.connectionAdapters[type.toLowerCase()];
			return new AdapterClass(adapterOptions);
		} else {
			return type; // Use as instance instead
		}
	},


	/**
	 * Version of package
	 *
	 * @property version
	 * @type {string}
	 */
	version: require('./package.json').version
};
module.exports = core;
