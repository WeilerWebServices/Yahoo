Preceptor-Reporter
==================

Reporting library for the preceptor test-runner and aggregator.

[![Build Status](https://img.shields.io/travis/yahoo/preceptor-reporter.svg)](http://travis-ci.org/yahoo/preceptor-reporter)
[![Coveralls Coverage](https://img.shields.io/coveralls/yahoo/preceptor-reporter.svg)](https://coveralls.io/r/yahoo/preceptor-reporter)
[![Code Climate Grade](https://img.shields.io/codeclimate/github/yahoo/preceptor-reporter.svg)](https://codeclimate.com/github/yahoo/preceptor-reporter)

[![NPM version](https://badge.fury.io/js/preceptor-reporter.svg)](https://www.npmjs.com/package/preceptor-reporter)
[![NPM License](https://img.shields.io/npm/l/preceptor-reporter.svg)](https://www.npmjs.com/package/preceptor-reporter)

[![NPM](https://nodei.co/npm/preceptor-reporter.png?downloads=true&stars=true)](https://www.npmjs.com/package/preceptor-reporter)
[![NPM](https://nodei.co/npm-dl/preceptor-reporter.png?months=3&height=2)](https://www.npmjs.com/package/preceptor-reporter)

[![Coverage Report](https://img.shields.io/badge/Coverage_Report-Available-blue.svg)](http://yahoo.github.io/preceptor-reporter/coverage/lcov-report/)
[![API Documentation](https://img.shields.io/badge/API_Documentation-Available-blue.svg)](http://yahoo.github.io/preceptor-reporter/docs/)

[![Gitter Support](https://img.shields.io/badge/Support-Gitter_IM-yellow.svg)](https://gitter.im/preceptorjs/support)

**Table of Contents**
* [Usage](#usage)
    * [Configuration](#configuration)
* [Manager](#manager)
* [Plugins](#plugins)
    * [Reporter](#reporter)
        * [Plugin management methods](#plugin-management-methods)
        * [Common configuration](#common-configuration)
        * [Dot](#dot)
        * [Duration](#duration)
        * [Event](#event)
        * [JenkinsSauceLabs](#jenkinssaucelabs)
        * [Json](#json)
        * [Junit](#junit)
        * [LineSummary](#linesummary)
        * [list](#list)
        * [Plain](#plain)
        * [Preceptor](#preceptor)
        * [Spec](#spec)
        * [Summary](#summary)
        * [Tap](#tap)
        * [TeamCity](#teamcity)
        * [Custom Plugin](#customplugin)
    * [Listener](#listener)
        * [Plugin management methods](#plugin-management-methods-1)
        * [Common configuration](#common-configuration-1)
        * [Preceptor](#preceptor-1)
        * [TeamCity](#teamcity-1)
        * [Custom Plugin](#customplugin-1)
    * [Loader](#loader)
        * [Common configuration](#common-configuration-2)
        * [Junit](#junit-1)
        * [Tap](#tap-1)
        * [Istanbul](#istanbul)
        * [Example](#example)
        * [Custom Plugin](#customplugin-2)
    * [Messenger](#messenger)
        * [Common configuration](#common-configuration-3)
        * [Example](#example-1)
        * [Custom Plugin](#customplugin-3)
    * [Hooks](#hooks)
* [API-Documentation](#api-documentation)
* [Tests](#tests)
* [Third-party libraries](#third-party-libraries)
* [License](#license)


##Usage

This module is bundled with Preceptor by default and does not need to be included in the ```plugins``` list of the global configuration section in the Preceptor configuration file.
However, you need to define the reporters that should be attached to the Preceptor test-events. You can add multiple reporters at the same time, all of which receive the same events from the Preceptor clients. Here is an example adding the ```Junit```, the ```List``` and the ```Spec``` reporter plugin to the reporter list:

```javascript
"configuration": {
	
	// ...
	
	"reportManager": {
		"listener": [],
		"reporter": [
			{ "type": "Spec" },
			{ "type": "List", "progress": false },
			{ "type": "Junit", "path": __dirname + "/test-results.xml" }
		]
	}
	
	// ...
}
```

###Configuration
The following configuration options are available for this module:
* ```reporter``` - List of reporters to activate (see above example)
* ```listener``` - List of listeners to activate

##Manager
The Manager object is the main access-point to the reporting plugin. It gives access to the plugin management methods, to the defined test-framework hooks, the defined messengers, and all abstract objects for creating your own reporting plugins.

##Plugins

###Reporter
Reporter plugins are the core of this library and represent the plugins that can export events.

The following reporter are available:
* ```Dot```
* ```Duration```
* ```Event```
* ```JenkinsSauceLabs```
* ```Json```
* ```Junit```
* ```LineSummary```
* ```List```
* ```Plain```
* ```Preceptor```
* ```Spec```
* ```Summary```
* ```Tap```
* ```TeamCity```

####Plugin management methods
Here is a short summary of the methods available to access reporter plugins and instances thereof (see API documentation for more information):
* ```getActiveReporter``` - Gets a list of active reporter
* ```getReporterList``` - Gets a dictionary of all registered reporter
* ```hasReporter``` - Checks if a specific reporter is registered
* ```getReporter``` - Gets a specific reporter from the list of registered reporter. It will return the constructor of the reporter.
* ```registerReporter``` - Registers a new reporter by giving it an identifier and the reporter constructor
* ```registerReporterRange``` - Registers a list of new reporter with a dictionary of identifier and reporter constructor
* ```addReporter``` - Creates a new instance of a specific reporter and adds it to the active-reporter list
* ```addReporterRange``` - Creates a list of reporter and adds them all to the active-reporter list

####Common configuration
All reporter have a common set of configuration options:
* ```type``` - Type of reporter
* ```path``` - Filesystem path to where the test-results should be exported. If none is given, then no filesystem output will be done.
* ```configuration``` - Custom configuration options for a specific reporter
* ```color``` - Flag that determines if the output should be in color. (default: true)
* ```output``` - Flag that determines if there should be an output to the console. (default: undefined - leaving it to the reporter to decide)
* ```progress``` - Flag that determines if there should be a constant update when action states are changing. (default: undefined - leaving it to the reporter to decide)

Generally, there are two modes a reporter can be in (and both at the same time):
* file-output
* screen-output

Some of the reporters might want to prescribe how it should behave (like showing progress), but it can always be overwritten by the user.

####Dot
This reporter prints a character for each test. The character will tell what the result of the test has been.
* ```.``` - Test has passed
* ```F``` - Test has failed
* ```E``` - Test had error
* ```U``` - Test is undefined
* ```S``` - Test was skipped
* ```I``` - Test is incomplete

####Duration
This reporter prints the total duration of all tests when all test had been finished.

####Event
Every test-event is emitted by this reporter, and could pick-up by any listener that is attached to the object.

For every test-event, the event reporter will trigger three individual event types, including sub-types:
* ```message``` - Generic message, giving the area-type, the message-type, and the message-data as an array of items
* <area-type>
    * ```admin``` - Administration events, grouping messages of ```start```, ```stop```, ```complete```
    * ```item``` - Item events, grouping messages of ```itemData``` and ```itemMessage```
    * ```suite``` - Suite events, grouping messages of ```suiteStart``` and ```suiteEnd```
    * ```test``` - Test events, grouping messages of ```testStart```, ```testPassed```, ```testError```, ```testFailed```, ```testUndefined```, ```testSkipped```, and ```testIncomplete```
* <message-type>
    * ```start``` - Start of Preceptor
    * ```stop``` - End of Preceptor
    * ```complete``` - Completion of all processing after ```stop```
    * ```itemData``` - Custom test-event data, giving the id of the test-action and the data as JSON string
    * ```itemMessage``` - Custom test-event message, giving the id of the test-action and the message
    * ```suiteStart``` - Start of a test-suite, giving the id of the test-action, the parent-id, and the suite-name
    * ```suiteEnd``` - End of a test-suite, giving the id of the test-action
    * ```testStart``` - Start of a test, giving the id of the test-action, the parent-id, and the test-name
    * ```testPassed``` - Successful completion of test, giving the id of the test-action
    * ```testFailed``` - Failed test, giving the id of the test-action, the message, and the reason of failing
    * ```testError``` - Test with unexpected error, giving the id of the test-action, the message, and the reason of the error
    * ```testUndefined``` - Test-case that hasn't been defined yet, giving the id of the test-action
    * ```testSkipped``` - Skipped test-case, giving the id of the test-action and the reason of skipping
    * ```testIncomplete``` - Test that is still WIP, giving the id of the test-action

####JenkinsSauceLabs
The reporter prints the job-name for a Selenium session, binding the job-name to the Selenium test-run.

The session-id is determined by taking several steps in a row until a session-id is found. The following steps are taken in order:
* ```sessionId``` value in the test-root ```itemData``` property
* ```sessionId``` value of the ```JenkinsSauceLabs``` reporter configuration
* ```SELENIUM_SESSION_ID``` in the environment variables

The job-name is determined by taking the following steps:
* ```jobName``` value in the test-root ```itemData``` property
* ```jobName``` value of the ```JenkinsSauceLabs``` reporter configuration
* ```APP_NAME``` and ```BUILD_NUMBER``` in the environment variables, combining in the format: "APP_NAME(#BUILD_NUMBER)"

####Json
This reporter exports all test-data at once.

####Junit
The JUnit reporter exports all test-data as an XML format.

####LineSummary
With this reporter, the test results are summarized in one line when all the tests are completed.

####List
The reporter lists-up all the issues which were reported during the test-runs.

####Plain
This reporter prints out all test events in a plain text-format. This reporter can be used for debugging purposes when creating a custom reporter, learning about all the test-events that are triggered.

####Preceptor
The Preceptor reporter prints out one-to-one test-events so that a parent Preceptor instance could pick-up all the events, integrating it into the parent test-result data.

#####Format
The general Preceptor format is as follows:
```
#|#<messageType> <data>#|#\n
```

The protocol sends out the version identifier for this format before any other message is send out.
**Version** - Version of data-format
```
#|#version 1#|#\n
```

Here is a full list of all the messages sent out. Please see the API documentation for more information.

**ItemData** - Custom data for test-action
```
#|#itemData [<id>, <json>]#|#\n
```

**ItemMessage** - Custom message for test-action
```
#|#itemMessage [<id>, <message>]#|#\n
```

**SuiteStart** - Start of a suite
```
#|#suiteStart [<id>, <parentId>, <suiteName>]#|#\n
```

**SuiteEnd** - End of a suite
```
#|#suiteEnd [<id>]#|#\n
```

**TestStart** - Start of a test
```
#|#testStart [<id>, <parentId>, <testName>]#|#\n
```

**TestPassed** - End of test, marking test as passed
```
#|#testPassed [<id>]#|#\n
```

**TestFailed** - End of test, marking test as failed
```
#|#testFailed [<id>, <message>, <reason>]#|#\n
```

**TestError** - End of test, marking it as having an error
```
#|#testError [<id>, <message>, <reason>]#|#\n
```

**TestUndefined** - End of test, marking it as undefined
```
#|#testUndefined [<id>]#|#\n
```

**TestSkipped** - End of test. marking it as skipped
```
#|#testSkipped [<id>, <reason>]#|#\n
```

**TestIncomplete** - End of test, marking it as incomplete
```
#|#testIncomplete [<id>]#|#\n
```

####Spec
The Spec reporter will print all test-events in an ordered and consistent format. This reporter has a very similar output format as the "spec"-reporter from Mocha.

####Summary
With this reporter, the test results are summarized with multiple lines when all the tests are completed.

####Tap
The TAP reporter exports the test-events in the [TAP](http://testanything.org/tap-version-13-specification.html) format.

####TeamCity
The TeamCity reporter exports the test-events in the [TeamCity](https://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity) format. All tools understanding this format should be able to pick-up the test results reported by this reporter. This includes the IntelliJ IDE.

####Custom Plugin
You can create your own reporter plugin by using the exposed ```AbstractReporter``` object that is a property on the manager object.

```javascript
var ReportManager = require('preceptor-reporter');
var manager = new ReportManager();

var CustomReporter = ReportManager.AbstractReporter.extend(
	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// ...
		},


		/**
		 * Called when reporting starts
		 *
		 * @method start
		 */
		start: function () {
			// ...
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			// ...
		},


		/**
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			// ...
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			// ...
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			// ...
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			// ...
		},


		/**
		 * Called when test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 */
		testStart: function (id, parentId, testName) {
			// ...
		},


		/**
		 * Called when test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testFailed: function (id, message, reason) {
			// ...
		},

		/**
		 * Called when test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testError: function (id, message, reason) {
			// ...
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			// ...
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			// ...
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			// ...
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			// ...
		},


		/**
		 * Gets the collected output
		 *
		 * @method getOutput
		 * @return {string}
		 */
		getOutput: function () {
			return this._output;
		}
	}
);

manager.registerReporter('custom1', CustomReporter);
manager.addReporter('custom1', { /* Options */ });
```

There are a couple of terms that might need clarification:
* action - There are three action-types available: the root-element of all test-results, any test-suite, and any tests.
* ```itemMessage``` - These are custom messages that can be attached to any test-action.
* ```itemData``` - This is an object that could be used to save custom data for any test-action.

```start``` and ```end``` is called once before and after all the test-results respectively.

In general, all actions have a start and end. For tests, however, there is a multitude of end methods, each defining a different end-result. The start methods take an ID that is given by the reporting instance and should be used again when the action is ended, finishing up the pending action. Should any action be still pending after all tests are completed, then the reporting manager will throw an exception since a testing-framework might possibly have been interrupted and some of the data might be missing.

The ```getOutput``` method is called when all the collected data needs to be retrieved at once. This could be for saving the results to a file, or when printing the results at the end of the tests when ```progress``` is set to false.

All test-results and actions are saved in the test-container object.

```javascript
this.getContainer().getAction(id).name
```

The following items are saved for each action-type and can be accessed the same way as describe above:
* ```id``` - Identifier of action
* ```startTime``` - Start of action as an interger timestamp
* ```pending``` - Flag if action is pending or not
* ```type``` - Type of action. Possible values are: 'root', 'suite', 'test'
* ```name``` - Name of action
* ```level``` - Numeric depth-level starting with 0
* ```parentId``` - Parent action

See the above mentioned plugins for examples.

###Listener
Lister plugins are the opposite of Reporter plugins - these Listener plugins import data.

The following listener are available:
* ```Preceptor```
* ```TeamCity```

####Plugin management methods
Here is a short summary of the methods available to access listener plugins and instances thereof (see API documentation for more information):
* ```getActiveListener``` - Gets a list of active listener
* ```getListenerList``` - Gets a dictionary of all registered listener
* ```hasListener``` - Checks if a specific listener is registered
* ```getListener``` - Gets a specific listener from the list of registered listener. It will return the constructor of the listener.
* ```registerListener``` - Registers a new listener by giving it an identifier and the listener constructor
* ```registerListenerRange``` - Registers a list of new listener with a dictionary of identifier and listener constructor
* ```addListener``` - Creates a new instance of a specific listener and adds it to the active-listener list
* ```addListenerRange``` - Creates a list of listener and adds them all to the active-listener list

####Common configuration
All listener have a common set of configuration options:
* ```type``` - Type of listener
* ```configuration``` - Custom configuration options for a specific reporter
* ```placeholder``` - List of placeholder given to the ```parse``` method when parsing the input (see section about custom listener plugin).

####Preceptor
The Preceptor listener can pick any information printed by a Preceptor process, integrating the processes result into its own results. See the reporter section above for more information about the data-format.

####TeamCity
The TeamCity listener can listen for any messages that were meant for TeamCity receivers, for example the IntelliJ IDE. Any testing-framework that can export test-results to IntelliJ (and their like) can also be used to send these test information a Preceptor instance.

#####Configuration
This listener has the following configuration options:
* ```parentId``` {string} - Identifier of parent action

####Custom Plugin
You can create your own listener plugin by using the exposed ```AbstractListener``` object that is a property on the manager object.

```javascript
var ReportManager = require('preceptor-reporter');
var manager = new ReportManager();

var CustomListener = ReportManager.AbstractListener.extend(
	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// ...
		},


		/**
		 * Parses a string and extracts message information
		 *
		 * @method parse
		 * @param {string} text
		 * @param {object} [placeholder]
		 * @return {string}
		 */
		parse: function (text, placeholder) {
			// ...
		}
	}
);

manager.registerListener('custom1', CustomListener);
manager.addListener('custom1', { /* Options */ });
```

The parse method will be called with text that needs to be parsed. This is usually output of a process. The placeholder might have key-value pairs of text that needs to be replaced within the messages.

See the above mentioned plugins for examples.

###Loader
Loader plugins are objects that import common test and coverage reports, and they can be used independently by other projects since they are exposed by the ```getLoaders``` method on the Manager object constructor.

The following loaders are available:
* ```junit``` - Object that imports JUnit xml test-report files
* ```tap``` - Object that imports TAP test-report files
* ```istanbul``` - Object that imports Istanbul JSON coverage files

####Common configuration
All loaders have a common set of configuration options:
* ```type``` - Type of loader (currently not used)
* ```configuration``` - Custom configuration options for a specific loader
* ```path``` - Glob path to files that should be imported

####JUnit
The JUnit loader has the following configuration options:
* ```topLevel``` - Flag that indicates if the ```testsuites``` level should be imported. (default: false)

####TAP
The TAP loader currently does not have custom configuration options.

####Istanbul
* ```mapping``` - List of mapping objects that hav property ```from``` and ```to```. ```from``` is a regular expression (as string), and ```to``` is a string.

####Example
```javascript
var junit = new Preceptor.getLoaders().junit({
	path: __dirname + "/*.xml",
	configuration: {
		topLevel: true
	}
);

junit.on('message', function (areaType, messageType, params) {
	console.log(areaType, messageType, params);
});
```

####Custom Plugin
You can create your own loader plugin by using the exposed ```AbstractLoader``` object that is a property on the manager object.

```javascript
var ReportManager = require('preceptor-reporter');

var CustomLoader = ReportManager.AbstractLoader.extend(
	{
		// ...
	}
);
```

See the above mentioned plugins for examples.

###Messenger
Messenger plugins are objects that create low-level messages for external systems, and they can be used independently by other projects since they are exposed by the ```getMessengers``` method on the Manager object constructor.

The following messengers are available:
* ```JenkinsSauceLabs``` - Object that prints Sauce-Labs job information to the Jenkins build log, letting the Jenkins SauceLabs plugin know about the job-name.
* ```Preceptor``` - Object that prints Preceptor event messages to the standard output.
* ```TeamCity``` - Object that prints Team-City event messages to the standard output. Most of the messenges can also be understood by the IntelliJ IDE.

It is important to note that these messengers have no consistent interface as they represent low-level objects. However, messengers trigger always an event on the messenger itself with the event-name ```message``` that is the exact message that is created for the external system.

####Common configuration
All messenger have a common set of configuration options:
* ```type``` - Type of messenger
* ```configuration``` - Custom configuration options for a specific messenger
* ```output``` - Flag that determines if the events are printed to the console. (default: false)

####Example
```javascript
var messengers = Preceptor.getMessengers();
var teamCityMessenger = new messengers.TeamCity();

teamCityMessenger.testSuiteStarted("Suite #1");

teamCityMessenger.testStarted("Test #1");
teamCityMessenger.testFinished("Test #1", 20);

teamCityMessenger.testStarted("Test #2");
teamCityMessenger.testFailed("Test #2", true, "Division by zero.", "...");

teamCityMessenger.testSuiteFinished("Suite #1");
```

####Custom Plugin
You can create your own messenger plugin by using the exposed ```AbstractMessenger``` object that is a property on the manager object.

```javascript
var ReportManager = require('preceptor-reporter');

var CustomMessenger = ReportManager.AbstractMessenger.extend(
	{
		// ...
	}
);
```

See the above mentioned plugins for examples.

###Hooks
Hooks are custom reporters for different testing frameworks, giving Preceptor access to different stages of the test lifecycle.

The following hooks are available:
* ```cucumber``` - Cucumber hooks
* ```mocha``` - Mocha hooks

##API-Documentation

Generate the documentation with following command:
```shell
npm run docs
```
The documentation will be generated in the ```docs``` folder of the module root.

##Tests

Run the tests with the following command:
```shell
npm run test
```
The code-coverage will be written to the ```coverage``` folder in the module root.

##Third-party libraries

The following third-party libraries are used by this module:

###Dependencies
* glob: https://github.com/isaacs/node-glob
* preceptor-core: https://github.com/yahoo/preceptor-core
* sax: https://github.com/isaacs/sax-js
* promise: https://github.com/then/promise
* underscore: http://underscorejs.org
* xmlbuilder: http://github.com/oozcitak/xmlbuilder-js

###Dev-Dependencies
* chai: http://chaijs.com
* codeclimate-test-reporter: https://github.com/codeclimate/javascript-test-reporter
* coveralls: https://github.com/cainus/node-coveralls
* istanbul: https://github.com/gotwarlost/istanbul
* mocha: https://github.com/visionmedia/mocha
* cucumber: http://github.com/cucumber/cucumber-js
* sinon: http://sinonjs.org
* sinon-chai: https://github.com/domenic/sinon-chai
* yuidocjs: https://github.com/yui/yuidoc

##License

The MIT License

Copyright 2014-2015 Yahoo Inc.
