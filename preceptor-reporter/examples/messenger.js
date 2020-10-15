// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var ReportManager = require('../');

var messengers = ReportManager.getMessengers();

// Jenkins SauceLabs Messenger
(function () {
	var Class, instance;

	console.log("\n\n\nJenkins SauceLabs Messenger\n\n");

	Class = messengers.JenkinsSauceLabs;
	instance = new Class({output: true});

	instance.sendBuildInfo('session-1234', 'job-5678');

	// Output:
	// SauceOnDemandSessionID=session-1234 job-name=job-5678
}());

// Preceptor Messenger
(function () {
	var Class, instance;

	console.log("\n\n\nPreceptor Messenger\n\n");

	Class = messengers.Preceptor;
	instance = new Class({output: true});

	instance.version();

	instance.itemData('123', ["listItem"]);
	instance.itemData('123', 23);
	instance.itemData('123', "only-string");
	instance.itemData('123', {obj: 23});

	instance.itemMessage('123', "This is a test-message.");

	instance.suiteStart('123', '0', "Suite-Name");
	instance.suiteEnd('123');

	instance.testStart('123', '0', "Test-Name");
	instance.testFailed('123', "Division by zero", "You should not do that");
	instance.testError('123', "Item does not exist", "Check for being null");
	instance.testPassed('123');
	instance.testUndefined('123');
	instance.testSkipped('123', "DB wasn't there");
	instance.testIncomplete('123');

	// Output:
	// #|# version 1 #|#
	// #|# version 1 #|#
	// #|# itemData ["123","[\"listItem\"]"] #|#
	// #|# itemData ["123","23"] #|#
	// #|# itemData ["123","\"only-string\""] #|#
	// #|# itemData ["123","{\"obj\":23}"] #|#
	// #|# itemMessage ["123","This is a test-message."] #|#
	// #|# suiteStart ["123","0","Suite-Name"] #|#
	// #|# suiteEnd ["123"] #|#
	// #|# testStart ["123","0","Test-Name"] #|#
	// #|# testFailed ["123","Division by zero","You should not do that"] #|#
	// #|# testError ["123","Item does not exist","Check for being null"] #|#
	// #|# testPassed ["123"] #|#
	// #|# testUndefined ["123"] #|#
	// #|# testSkipped ["123","DB wasn't there"] #|#
	// #|# testIncomplete ["123"] #|#
}());

// TeamCity Messenger
(function () {
	var Class, instance;

	console.log("\n\n\nTeamCity Messenger\n\n");

	Class = messengers.TeamCity;
	instance = new Class({output: true});

	instance.testSuiteStarted("test-suite");
	instance.testStarted("test-case");
	instance.testFinished("test-case", 23);
	instance.testFailed("test-case", false, "Division by zero", "You should not do that");
	instance.testFailed("test-case", true, "Item does not exist", "Check for being null");
	instance.testIgnored("test-case", "DB wasn't there");
	instance.testSuiteFinished("test-suite");

	// Output:
	// ##teamcity[testSuiteStarted name='test-suite']
	// ##teamcity[testStarted name='test-case']
	// ##teamcity[testFinished name='test-case' duration='23']
	// ##teamcity[testFailed name='test-case' message='Division by zero' details='You should not do that']
	// ##teamcity[testFailed name='test-case' message='Item does not exist' details='Check for being null' error='true']
	// ##teamcity[testIgnored name='test-case' message='DB wasn|'t there']
	// ##teamcity[testSuiteFinished name='test-suite']
}());
