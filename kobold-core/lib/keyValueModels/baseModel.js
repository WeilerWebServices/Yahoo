// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var CoreBase = require('preceptor-core').Base;
var Promise = require('promise');

var BaseModel = CoreBase.extend(

	/**
	 * Key-Value model constructor
	 *
	 * @constructor
	 * @param {string} id
	 * @param {object} [options]
	 *
	 * @property {object} _options
	 * @property {ConnectionAdapter} _connection
	 * @property {object} _data
	 */
	function (id, options) {
		this.__super();

		this._data = {
			id: id
		};

		this._options = options || {};
		this._connection = options.connection;

		this.initialize();
	},

	/** @lends BaseModel.prototype */
	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Nothing by default
		},

		/**
		 * Gets the connection adapter
		 *
		 * @method getConnection
		 * @return {ConnectionAdapter}
		 */
		getConnection: function () {
			return this._connection;
		},

		/**
		 * Gets the model id
		 *
		 * @method getId
		 * @return {string}
		 */
		getId: function () {
			return this._data.id;
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @type string
		 */
		TYPE: 'BaseModel',


		/**
		 * Default filter that accepts everything
		 *
		 * @method filter
		 * @return {boolean}
		 */
		filter: function () {
			return true;
		}
	});

module.exports = BaseModel;
