// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

/**
 * Reporter hook for mocha
 *
 * @class Hooks
 * @method mochaHook
 * @param {ReportManager} reportManager
 * @param {string} reportId
 * @param {function} [finishedCallback]
 * @return {function}
 */
var mochaHook = function (reportManager, reportId, finishedCallback) {

	var reporterIdStack = [{type: 'root', id: reportId}], reporterIdCounter = 0;

	/**
	 * Hook function for sub-system
	 *
	 * @param {*} runner Mocha test-runner
	 * @return {function}
	 */
	return function (runner) {

		// Sending updates to reporter
		runner.on('suite', function (suite) {
			var id = "suite-" + (reporterIdCounter++) + '_' + reportId, parentIdObj = reporterIdStack[0];

			reporterIdStack.unshift({type: 'suite', id: id});
			reportManager.processMessage("suiteStart", [id, parentIdObj.id, suite.title]);
		});

		runner.on('suite end', function (suite) {
			if (reporterIdStack.length === 1) return; // suite end is called more often than started
			var idObj = reporterIdStack.shift();
			if (idObj.type !== "suite") {
				throw new Error('Error with reporter id stack. Expected a suite id but got ' + idObj.type);
			}
			reportManager.processMessage("suiteEnd", [idObj.id]);
		});


		runner.on('test', function (test) {
			var id = "test-" + (reporterIdCounter++) + '_' + reportId, parentIdObj = reporterIdStack[0];

			reporterIdStack.unshift({type: 'test', id: id});
			reportManager.processMessage("testStart", [id, parentIdObj.id, test.title]);
		});


		runner.on('pass', function (test) {
			var idObj = reporterIdStack.shift();

			if (idObj.type !== "test") {
				throw new Error('Error with reporter id stack. Expected a test id but got ' + idObj.type);
			}

			reportManager.processMessage("testPassed", [idObj.id]);
		});
		runner.on('fail', function (test, err) {

			var idObj;

			if (test.type === 'hook') { // Something went wrong in the hooks

				idObj = reporterIdStack[0];
				if (idObj.type === "test") {
					reporterIdStack.shift();
					reportManager.processMessage("testFailed", [idObj.id, err.message, err.stack.toString()]);
				}
				console.log(err.stack);

			} else {

				idObj = reporterIdStack.shift();

				if (idObj.type !== "test") {
					throw new Error('Error with reporter id stack. Expected a test id but got ' + idObj.type);
				}

				reportManager.processMessage("testFailed", [idObj.id, err.message, err.stack.toString()]);
			}
		});
		runner.on('pending', function (test) {
			var id = "test-" + (reporterIdCounter++) + '_' + reportId, parentIdObj = reporterIdStack[0];

			reportManager.processMessage("testStart", [id, parentIdObj.id, test.title]);
			reportManager.processMessage("testIncomplete", [id, "Pending"]);
		});

		runner.on('end', function () {
			if (finishedCallback) {
				finishedCallback();
			}
		});
	};
};

module.exports = mochaHook;
