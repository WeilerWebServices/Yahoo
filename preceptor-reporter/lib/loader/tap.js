// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractLoader = require('../abstractLoader');
var fs = require('fs');
var Promise = require('promise');

/**
 * @class TapLoader
 * @extends AbstractLoader
 * @constructor
 *
 * @property {int} _length Length of test
 * @property {int} _counter Current number of tests found
 */
var TapLoader = AbstractLoader.extend(

	{
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

			this._length = 0;
			this._counter = 0;

			return new Promise(function (resolve, reject) {

				fs.readFile(file, function (err, data) {

					var lines, i, len, id, reporter;

					if (err) {
						reject(err);

					} else {
						lines = data.toString().split("\n");

						lines.forEach(function (line) {
							this._processLine(parentId, line);
						}.bind(this));


						// Make sure that missing tests will also be reported
						reporter = this.getReporter();

						len = this._length - this._counter;
						for (i = 0; i < len; i++) {

							id = this.newId() + '';

							reporter.testStart(id, parentId, 'Untitled Test');
							reporter.testFailed(id, 'Failed');
						}

						resolve();
					}

				}.bind(this));
			}.bind(this));
		},

		/**
		 * Process a single line
		 *
		 * @param {string} parentId
		 * @param {string} line
		 * @private
		 */
		_processLine: function (parentId, line) {

			var matches, success, name, state, message,

				id, reporter,

				planRegex = /\s*(\d+)(\.{2})(\d+)\s*(#\s*(SKIP|skip)\s*([^#]+))?\s*(#\s*(.*))?/, resultRegex = /\s*(ok|not ok)\s*(\d*)\s*([^#]*)?\s*(#\s*(SKIP|skip|TODO|todo)\s*([^#]+))?\s*(#\s*(.*))?/;

			if (line.match(planRegex)) {
				matches = line.match(planRegex);
				this._length = parseInt(matches[3], 10) - parseInt(matches[1], 10) + 1;

			} else if (line.match(resultRegex)) {
				matches = line.match(resultRegex);

				// Get values
				success = (matches[1].toLowerCase() === 'ok');
				name = (matches[3] || '').trim() || 'Untitled Test';
				state = (matches[5] || '').trim().toLowerCase();
				message = (matches[6] || '').trim();

				// Prepare values
				id = this.newId() + '';
				reporter = this.getReporter();

				// Start test
				reporter.testStart(id, parentId, name);

				this._counter++;

				// Complete test
				if (success) { // On success

					if (state === 'skip') { // When skipped
						reporter.testSkipped(id, message.length ? message : 'Skipped');

					} else if (state === 'todo') { // When incomplete
						reporter.testIncomplete(id);

					} else {
						reporter.testPassed(id);
					}

				} else { // On failure

					if (state === 'skip') { // When skipped
						reporter.testSkipped(id, message.length ? message : 'Skipped');

					} else if (state === 'todo') { // When incomplete
						reporter.testIncomplete(id);

					} else { // When really failed
						reporter.testFailed(id, message.length ? message : 'Failed');
					}
				}
			}
		}
	}
);

module.exports = TapLoader;
