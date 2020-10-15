// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractMessenger = require('../abstractMessenger');

/**
 * @class Jenkins Sauce-Labs messenger
 * @extends AbstractMessenger
 * @constructor
 */
var JenkinsSauceLabsMessenger = AbstractMessenger.extend(

	{
		/**
		 * Send the build info to jenkins
		 *
		 * @method sendBuildInfo
		 * @param {string} sessionId
		 * @param {string} jobName
		 * @param {object} [options]
		 */
		sendBuildInfo: function (sessionId, jobName, options) {
			this.trigger("SauceOnDemandSessionID=" + sessionId + " job-name=" + jobName + "\n", options);
		}
	}
);

module.exports = JenkinsSauceLabsMessenger;
