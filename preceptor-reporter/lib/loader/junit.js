// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractLoader = require('../abstractLoader');
var sax = require('sax');
var fs = require('fs');
var Promise = require('promise');

/**
 * @class JUnitLoader
 * @extends AbstractLoader
 * @constructor
 *
 * @property {object} _childNode
 */
var JUnitLoader = AbstractLoader.extend(

	{
		/**
		 * Should the top-level be used for import?
		 *
		 * @method shouldUseTopLevel
		 * @return {boolean}
		 */
		shouldUseTopLevel: function () {
			return this.getConfiguration().topLevel;
		},

		/**
		 * Starts the current entry
		 *
		 * @method _startEntry
		 * @param {EventReporter} reporter
		 * @param {object} entry
		 * @param {string[]} parentIds
		 * @private
		 */
		_startEntry: function (reporter, entry, parentIds) {

			var parentId = parentIds[parentIds.length - 1];

			if ((entry.name === 'testsuites') && (this.shouldUseTopLevel())) {
				reporter.suiteStart(entry.id, parentId, entry.attributes.name || 'Untitled Suite');
				parentIds.push(entry.id);

			} else if (entry.name === 'testsuite') {
				reporter.suiteStart(entry.id, parentId, entry.attributes.name || 'Untitled Suite');
				parentIds.push(entry.id);

			} else if ('testcase' === entry.name) {
				this._childNode = null;
				reporter.testStart(entry.id, parentId, entry.attributes.name || 'Untitled Test');
				parentIds.push(entry.id);

			} else if (entry.name !== 'testsuites') {
				parentIds.push(entry.id);
			}
		},

		/**
		 * Completes the current entry
		 *
		 * @method _completeEntry
		 * @param {EventReporter} reporter
		 * @param {object[]} stack
		 * @param {string[]} parentIds
		 * @private
		 */
		_completeEntry: function (reporter, stack, parentIds) {

			var entry = stack.pop();

			parentIds.pop();

			if (!entry) {
				return;
			}

			if ((entry.name === 'testsuites') && (this.shouldUseTopLevel())) {
				reporter.suiteEnd(entry.id);

			} else if (entry.name === 'testsuite') {
				reporter.suiteEnd(entry.id);

			} else if (entry.name === 'testcase') {

				if (this._childNode && (['failure', 'error', 'skipped'].indexOf(this._childNode.name) !== -1)) {

					if (this._childNode.name === 'failure') {
						reporter.testFailed(entry.id, this._childNode.attributes.type, this._childNode.attributes.message);

					} else if (this._childNode.name === 'error') {
						reporter.testError(entry.id, this._childNode.attributes.type, this._childNode.attributes.message);

					} else if (this._childNode.name === 'skipped') {

						if (this._childNode.attributes.type === 'undefined') {
							reporter.testUndefined(entry.id);

						} else if (this._childNode.attributes.type === 'incomplete') {
							reporter.testIncomplete(entry.id);

						} else {
							reporter.testSkipped(entry.id, this._childNode.attributes.message || this._childNode.attributes.type);
						}
					}
				} else {
					reporter.testPassed(entry.id);
				}

			} else {
				this._childNode = entry;
			}
		},

		/**
		 * Creates a new stub
		 *
		 * @method _createNewStub
		 * @return {object}
		 * @private
		 */
		_createNewStub: function () {
			return {
				id: this.newId() + '',
				attributes: {},
				name: null
			};
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

			var reporter = this.getReporter();

			this._childNode = null;

			return new Promise(function (resolve, reject) {

				fs.readFile(file, function (err, data) {

					var parser, stack = [], parentIds = [parentId], entry = this._createNewStub();

					if (err) {
						reject(err);

					} else {

						parser = sax.parser(true);

						parser.onerror = function (e) {
							reject(e);
						}.bind(this);

						parser.onopentag = function (node) {

							entry = this._createNewStub();
							stack.push(entry);

							entry.name = node.name;
							entry.attributes = node.attributes;

							this._startEntry(reporter, entry, parentIds);

						}.bind(this);

						parser.onclosetag = function () {
							this._completeEntry(reporter, stack, parentIds);
						}.bind(this);

						parser.onend = function () {
							resolve();
						}.bind(this);

						parser.write(data.toString('utf-8')).close();
					}
				}.bind(this));
			}.bind(this));
		}
	}
);

module.exports = JUnitLoader;
