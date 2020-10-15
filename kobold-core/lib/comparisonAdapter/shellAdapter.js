// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Promise = require('promise');

var os = require('os');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var ComparisonAdapter = require('./comparisonAdapter');

var tmpCounter = 0;

/**
 * Shell comparison adapter
 *
 * @class ShellAdapter
 * @extends ComparisonAdapter
 */
var ShellAdapter = ComparisonAdapter.extend(

	/** @lends ShellAdapter.prototype */
	{
		/**
		 * Generates a unique temp. path
		 *
		 * @method _generateTempPath
		 * @param {string} id
		 * @return {string}
		 * @private
		 */
		_generateTempPath: function (id) {
			tmpCounter++;
			return path.join(os.tmpDir(), id + +(new Date())) + '_' + tmpCounter + '.png';
		},


		/**
		 * Gets the selected environment variables
		 *
		 * @method getEnv
		 * @return {object}
		 */
		getEnv: function () {
			return this.getOptions().env || {};
		},

		/**
		 * Gets the current working directory where the comparison should be executed
		 *
		 * @method getCwd
		 * @return {string}
		 */
		getCwd: function () {
			return this.getOptions().cwd;
		},

		/**
		 * Gets the command to execute for comparison
		 *
		 * @method getCommand
		 * @return {string}
		 */
		getCommand: function () {
			return this.getOptions().cmd;
		},


		/**
		 * Runs the comparison
		 *
		 * @method run
		 * @return {Promise} With {boolean} for success/failure
		 */
		run : function () {
			return new Promise(function (resolve, reject) {

				var imageA = this.getImageA(),
					pathA,
					imageB = this.getImageB(),
					pathB,
					cwd, env, cmd;

				cwd = this.getCwd();
				env = this.getEnv();
				cmd = this.getCommand();

				if (!imageA) {
					throw new Error('First image is not given.');
				}
				if (!imageB) {
					throw new Error('Second image is not given.');
				}

				if (!cwd && !fs.existsSync(cwd)) {
					throw new Error("The working directory doesn't exist: " + cwd);
				}
				if (!cmd) {
					throw new Error("Command wasn't defined.");
				}

				pathA = this._generateTempPath('A');
				imageA.writeImage(pathA, function (err) {

					if (err) {
						reject(err);

					} else {

						pathB = this._generateTempPath('B');
						imageB.writeImage(pathB, function (err) {

							var proc, result = { code: null };

							if (err) {
								reject(err);

							} else {

								proc = childProcess.exec(this.getCommand(), {
									cwd: cwd,
									env: env,
									maxBuffer: 5 * 1024 * 1024

								}, function (error, stdout) {

									var image;

									if (error) {
										reject(error);

									} else {

										image = PNGImage.loadImage(stdout, function (error) {

											if (error) {
												reject(error);
											} else {
												this.setResultImage(image);
												resolve(result.code == 0);
											}

										}.bind(this));
									}
								}.bind(this));

								proc.on('close', function (code) {
									result.code = code;
								});
							}
						}.bind(this));
					}
				}.bind(this));
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
		TYPE: 'ShellAdapter'
	});

module.exports = ShellAdapter;
