// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

/**
 * Reporter hook for cucumber
 *
 * @class Hooks
 * @method cucumberHook
 * @param {ReportManager} reportManager
 * @param {string} reportId
 * @param {function} [finishedCallback]
 * @return {function}
 */
var cucumberHook = function (reportManager, reportId, finishedCallback) {

	var reporterIdStack = [reportId],
		reporterIdCounter = 0;

	/**
	 * Hook function for sub-system
	 *
	 * @return {function}
	 */
	return function () {

		this.BeforeFeature(function (event, callback) {

			var feature = event.getPayloadItem('feature'),
				id = "feature-" + (reporterIdCounter++) + '_' + reportId,
				parentId = reporterIdStack[0];

			reporterIdStack.unshift(id);
			reportManager.processMessage("suiteStart", [id, parentId, feature.getName()]);

			callback();
		});

		this.BeforeScenario(function (event, callback) {

			var scenario = event.getPayloadItem('scenario'),
				id = "scenario-" + (reporterIdCounter++) + '_' + reportId,
				parentId = reporterIdStack[0];

			reporterIdStack.unshift(id);
			reportManager.processMessage("suiteStart", [id, parentId, scenario.getName()]);

			callback();
		});

		this.BeforeStep(function (event, callback) {

			var step = event.getPayloadItem('step'),
				id = "step-" + (reporterIdCounter++) + '_' + reportId,
				parentId = reporterIdStack[0];

			reporterIdStack.unshift(id);
			reportManager.processMessage("testStart", [id, parentId, step.getName()]);

			callback();
		});

		this.StepResult(function (event, callback) {

			var stepResult = event.getPayloadItem('stepResult'),
				step = stepResult.getStep(),
				id, exception;

			if (step.getName() === undefined) {
				callback();
				return;
			}

			id = reporterIdStack.shift();

			if (id.substr(0, 5) !== "step-") {
				throw new Error('Error with reporter id stack. Expected a step id but got ' + id);
			}

			if (stepResult.isPending()) {
				reportManager.processMessage("testIncomplete", [id]);

			} else if (stepResult.isSkipped()) {
				reportManager.processMessage("testSkipped", [id, "Skipped"]);

			} else if (stepResult.isUndefined()) {
				reportManager.processMessage("testUndefined", [id]);

			} else if(stepResult.isFailed()) {
				exception = stepResult.getFailureException();
				reportManager.processMessage("testFailed", [id, exception.message, exception.stack.toString()]);

			} else {
				reportManager.processMessage("testPassed", [id]);
			}

			callback();
		});

		this.AfterScenario(function (event, callback) {

			var scenario = event.getPayloadItem('scenario'),
				id = reporterIdStack.shift();

			if (id.substr(0, 9) !== "scenario-") {
				throw new Error('Error with reporter id stack. Expected a scenario id but got ' + id);
			}
			reportManager.processMessage("suiteEnd", [id]);

			callback();
		});

		this.AfterFeature(function (event, callback) {

			var feature = event.getPayloadItem('feature'),
				id = reporterIdStack.shift();

			if (id.substr(0, 8) !== "feature-") {
				throw new Error('Error with reporter id stack. Expected a feature id but got ' + id);
			}
			reportManager.processMessage("suiteEnd", [id]);

			callback();
		});

		this.AfterFeatures(function (event, callback) {
			if (finishedCallback) {
				finishedCallback();
			}
			callback();
		});
	};
};

module.exports = cucumberHook;
