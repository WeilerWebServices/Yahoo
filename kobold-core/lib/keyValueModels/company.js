// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var BaseModel = require('baseModel');
var Promise = require('promise');
var _ = require('underscore');

var Department = require('./department');

/**
 * Company accessor class
 *
 * @class Company
 * @extends BaseModel
 * @param {object} [options]
 * @constructor
 */
var Company = BaseModel.extend({

	listDepartments: function () {
		return this._connection.getBucketKeys(this.getId());
	},

	getDepartment: function (name) {
		return new Department(name, {
			connection: this._connection,

			company: this.getId()
		});
	},

	remove: function () {
		return this.listDepartments().then(function (departments) {
			var promise = Promise.resolve();

			_.each(departments, function (department) {
				promise = promise.then(function () {
					return this.getDepartment(department).remove();
				}.bind(this));
			}.bind(this));

			return promise;
		})
	},

	save: function () {

	}

}, {
	/**
	 * Lists the names of items
	 *
	 * @param {ConnectionAdapter} connection
	 * @return {string[]}
	 */
	listNames: function (connection) {
		return connection.getBuckets(this.filter);
	},

	/**
	 * Gets a specific entry
	 *
	 * @param {string} name
	 * @return {BaseModel}
	 */
	get: function (name) {
		return new this(name);
	},

	/**
	 * Filter for item
	 *
	 * @param {string} entry
	 * @return {boolean}
	 */
	filter: function (entry) {
		return (entry.substr(0, 8) === "company_");
	}
});

module.exports = Company;
