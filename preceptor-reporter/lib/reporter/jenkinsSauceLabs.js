// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractReporter = require('../abstractReporter');
var JenkinsSauceLabsMessenger = require('../messenger/jenkinsSauceLabs');

/**
 * @class JenkinsSauceLabsReporter
 * @extends AbstractReporter
 * @constructor
 *
 * @property {JenkinsSauceLabsMessenger} _messenger
 */
var JenkinsSauceLabsReporter = AbstractReporter.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.__super();

			this._messenger = new JenkinsSauceLabsMessenger();
			this._messenger.on('message', function (text, options) {
				this.console(options.id, options.msgType, text);
			}.bind(this));

			if (this.getOptions().progress === undefined) {
				this.getOptions().progress = false;
			}
			if (this.getOptions().output === undefined) {
				this.getOptions().output = true;
			}
		},

		/**
		 * Gets the web-driver session id
		 *
		 * It tries to get it from a couple different places:
		 * - itemData of the root as "sessionId"
		 * - reporter configuration as "sessionId"
		 * - environment variable "SELENIUM_SESSION_ID"
		 *
		 * #method getSessionId
		 * @return {string}
		 */
		getSessionId: function () {
			var sessionId, tree;

			if (!sessionId) {
				tree = this.getContainer().getTree();
				if (tree && tree.data) {
					sessionId = tree.data.sessionId;
				}
			}
			if (!sessionId) {
				sessionId = this.getConfiguration().sessionId;
			}
			if (!sessionId) {
				sessionId = process.env.SELENIUM_SESSION_ID;
			}

			return sessionId;
		},

		/**
		 * Gets the job-name, binding the name to the session
		 *
		 * It tries to get it from a couple different places:
		 * - itemData of the root as "jobName"
		 * - reporter configuration as "jobName"
		 * - environment variables with format "APP_NAME (#BUILD_NUMBER)"
		 *
		 * @method getJobName
		 * @return {string}
		 */
		getJobName: function () {
			var sessionId, tree;

			if (!sessionId) {
				tree = this.getContainer().getTree();
				if (tree && tree.data) {
					sessionId = tree.data.jobName;
				}
			}
			if (!sessionId) {
				sessionId = this.getConfiguration().jobName;
			}
			if (!sessionId) {
				if (process.env.APP_NAME && process.env.BUILD_NUMBER) {
					sessionId = process.env.APP_NAME + "(#" + process.env.BUILD_NUMBER + ")";
				}
			}

			return sessionId;
		},


		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {

			var sessionId, jobName;

			this.__super();

			// Get information required
			sessionId = this.getSessionId();
			jobName = this.getJobName();

			if (!sessionId) {
				throw new Error('Cannot find sessionId.');

			} else if (!jobName) {
				throw new Error('Cannot find jobName.');

			} else {
				this._messenger.sendBuildInfo(sessionId, jobName, {id: undefined, msgType: 'stop'});
			}
		}
	}
);

module.exports = JenkinsSauceLabsReporter;
