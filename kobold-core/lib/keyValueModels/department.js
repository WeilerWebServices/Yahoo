// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var BaseModel = require('baseModel');
var Promise = require('promise');
var uuid = require('uuid');

/**
 * Department accessor class
 *
 * @class Department
 * @extends BaseModel
 * @param {object} [options]
 * @constructor
 */
var Department = BaseModel.extend({

	getDepartmentNames: function () {
		return this._connection.getBuckets(this._departmentFilter);
	},

	getDepartment: function () {
		return this._connection.getBuckets(this._departmentFilter);
	},

	_departmentFilter: function (entry) {
		return (entry.substr(0, 11) === "department_");
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
		return (entry.substr(0, 11) === "department_");
	}
});

module.exports = Department;
