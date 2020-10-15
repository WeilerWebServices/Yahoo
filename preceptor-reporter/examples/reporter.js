// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var ReportManager = require('../');

(function () {
	var manager;

	console.log("\n\n\nDot Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Dot');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nDuration Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Duration');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nEvent Reporter\n\n");

	manager = new ReportManager();
	var reporter = manager.addReporter('Event');
	reporter.on('message', function (areaType, messageType, data) {
		console.log(areaType, messageType, data);
	});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nJenkins Sauce-Labs Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('JenkinsSauceLabs', {configuration: {sessionId: "23", jobName: "24"}});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nJson Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Json', {output: true, path: __dirname + '/data.json'});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nJunit Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Junit', {output: true, path: __dirname + '/junit.xml'});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nLine Summary Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('LineSummary');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nList Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('List');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nPlain Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Plain', {path: __dirname + '/plain.txt'});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nPreceptor Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Preceptor');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nSpec Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Spec');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nSummary Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Summary');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nTap Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Tap', {output: true, path: __dirname + '/tap.txt'});

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nTeamCity Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('TeamCity');

	runSequence(manager);
}());

(function () {
	var manager;

	console.log("\n\n\nMultiple Reporter\n\n");

	manager = new ReportManager();
	manager.addReporter('Dot');
	manager.addReporter('Spec', {progress: false});
	manager.addReporter('List');
	manager.addReporter('Summary', {color: false});
	manager.addReporter('Duration');
	manager.addReporter('LineSummary');

	runSequence(manager);
}());

function runSequence (manager) {
	manager.message().start();

	manager.message().suiteStart('1', undefined, "All Tests");

	// Add data to the root
	manager.message().itemData(undefined, '{"test":234, "test2":{"hello":"there"}}');
	manager.message().itemData(undefined, '{"test2":{"what":"is this?"}}');

	manager.message().itemMessage(undefined, "This is a test message for the root");

	(function () {

		manager.message().testStart('5', '1', '1. Test - success');
		manager.message().testPassed('5');

		// Add int to current item
		manager.message().itemData('5', '{"item":23}');
		manager.message().itemMessage('5', "This is a test message for item 5");

		(function () {
			manager.message().testStart('6', '1', '2. Test - skipped');
			manager.message().testSkipped('6', "I guess DB wasn't there");

			manager.message().suiteStart('2', '1', "Sub-Group 1");

			(function () {
				manager.message().testStart('7', '2', '3. Test - success');
				manager.message().testPassed('7');

				manager.message().suiteStart('4', '2', "Sub-Group 1.1");

				(function () {
					manager.message().testStart('8', '4', '4. Test - success');
					manager.message().testPassed('8');

					manager.message().testStart('10', '4', '5. Test - failed');
					manager.message().testFailed('10', "Is not equal to something", "Because it is not equal");

					manager.message().testStart('11', '4', '6. Test - error');
					manager.message().testError('11', "Some kind of exception", "For whatever reason");

					manager.message().testStart('12', '4', '7. Test - undefined');
					manager.message().testUndefined('12');

					manager.message().testStart('13', '4', '8. Test - skipped');
					manager.message().testSkipped('13', "I guess DB wasn't there");

					manager.message().testStart('14', '4', '9. Test - incomplete');
					manager.message().testIncomplete('14');
				}());

				manager.message().suiteEnd('4');
			}());

			manager.message().suiteEnd('2');
		}());

		(function () {
			manager.message().suiteStart('3', '1', "Sub-Group 2");

			(function () {
				manager.message().testStart('9', '3', '10. Test - success');
				manager.message().testPassed('9');

			}());

			manager.message().suiteEnd('3');
		}());

		// Testing if tests after a test-suite work
		manager.message().testStart('15', '1', '11. Test - failed');
		manager.message().testFailed('15', "Is not equal to something", "Because it is not equal");

		manager.message().testStart('16', '1', '12. Test - error');
		manager.message().testError('16', "Some kind of exception", "For whatever reason");

		manager.message().testStart('17', '1', '13. Test - undefined');
		manager.message().testUndefined('17');

		manager.message().testStart('18', '1', '14. Test - skipped');
		manager.message().testSkipped('18', "I guess DB wasn't there");

		manager.message().testStart('19', '1', '15. Test - incomplete');
		manager.message().testIncomplete('19');
	}());

	manager.message().suiteEnd('1');

	manager.message().stop();
	manager.message().complete();
}
