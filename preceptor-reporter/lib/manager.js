// Copyright 2014-2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var path = require('path');
var _ = require('underscore');

var ReportContainer = require('./container');

var EventReporter = require('./reporter/event');

var AbstractListener = require('./abstractListener');
var AbstractMessenger = require('./abstractMessenger');
var AbstractReporter = require('./abstractReporter');
var AbstractLoader = require('./abstractLoader');

/**
 * @class ReportManager
 * @extends Base
 *
 * @property {object} _options Options supplied when created
 * @property {ReportContainer} _container Report container
 *
 * @property {object} _reporterList Registered reporter
 * @property {AbstractReporter[]} _activeReporter Active reporter list
 *
 * @property {object} _listenerList Registered listener
 * @property {AbstractListener[]} _activeListener Active listener list
 *
 * @property {Event} _messageEvent Convenience reporter to trigger messages
 */
var ReportManager = Base.extend(

	/**
	 * Reporter manager constructor
	 *
	 * @param {object} [options]
	 * @param {object} [options.collect=true]
	 * @param {ReportContainer} [options.container]
	 * @constructor
	 */
	function (options) {
		this.__super();

		this._options = options || {};

		if (this._options.collect === undefined) {
			this._options.collect = true;
		}

		if (this._options.collect) {
			this._container = this._options.container || new ReportContainer();
		}

		this._reporterList = {};
		this._activeReporter = [];

		this._listenerList = {};
		this._activeListener = [];

		this._messageEvent = new EventReporter(null, {type: 'Event'});

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this._initializeReporterRegistry();
			this._initializeListenerRegistry();

			this._messageEvent.on('message', function (areaType, messageType, params) {
				this.processMessage(messageType, params);
			}.bind(this));
		},


		/**
		 * Initializes the reporter registry
		 *
		 * @method _initializeReporterRegistry
		 * @private
		 */
		_initializeReporterRegistry: function () {
			var defaultElements = [{name: 'dot', fileName: 'dot'}, {
				name: 'duration',
				fileName: 'duration'
			}, {name: 'event', fileName: 'event'}, {
				name: 'jenkinssaucelabs',
				fileName: 'jenkinsSauceLabs'
			}, {name: 'json', fileName: 'json'}, {name: 'junit', fileName: 'junit'}, {
				name: 'linesummary',
				fileName: 'lineSummary'
			}, {name: 'list', fileName: 'list'}, {name: 'plain', fileName: 'plain'}, {
				name: 'preceptor',
				fileName: 'preceptor'
			}, {name: 'spec', fileName: 'spec'}, {name: 'summary', fileName: 'summary'}, {
				name: 'tap',
				fileName: 'tap'
			}, {name: 'teamcity', fileName: 'teamCity'}, {name: 'intellij', fileName: 'teamCity'}];

			defaultElements.forEach(function (entry) {
				entry.path = path.join(__dirname, 'reporter', entry.fileName);
				entry.fn = utils.require(entry.path);
			}, this);

			this.registerReporterRange(defaultElements);
		},

		/**
		 * Initializes the listener registry
		 *
		 * @method _initializeListenerRegistry
		 * @private
		 */
		_initializeListenerRegistry: function () {
			var defaultElements = [{name: 'preceptor', fileName: 'preceptor'}, {
				name: 'teamcity',
				fileName: 'teamCity'
			}, {name: 'intellij', fileName: 'teamCity'}];

			defaultElements.forEach(function (entry) {
				entry.path = path.join(__dirname, 'listener', entry.fileName);
				entry.fn = utils.require(entry.path);
			}, this);

			this.registerListenerRange(defaultElements);
		},


		/**
		 * Should report-manager collect events?
		 *
		 * @method shouldCollect
		 * @return {boolean}
		 */
		shouldCollect: function () {
			return this.getOptions().collect;
		},


		/**
		 * Gets the options
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options || {};
		},

		/**
		 * Gets the container of messages
		 *
		 * @method getContainer
		 * @return {ReportContainer}
		 */
		getContainer: function () {
			return this._container;
		},


		/**
		 * Gets all the active reporter
		 *
		 * @method getActiveReporter
		 * @return {AbstractReporter[]}
		 */
		getActiveReporter: function () {
			return this._activeReporter || [];
		},

		/**
		 * Gets a dictionary of registered reporter
		 *
		 * @method getReporterList
		 * @return {object}
		 */
		getReporterList: function () {
			return this._reporterList || {};
		},


		/**
		 * Checks if a reporter is registered
		 *
		 * @method hasReporter
		 * @param {string} name
		 * @return {boolean}
		 */
		hasReporter: function (name) {
			return !!this.getReporterList()[name.toLowerCase()];
		},

		/**
		 * Gets a specific registered reporter
		 *
		 * @method getReporter
		 * @param {string} name
		 * @return {function}
		 */
		getReporter: function (name) {
			return this.getReporterList()[name.toLowerCase()];
		},

		/**
		 * Registers a reporter
		 *
		 * @method registerReporter
		 * @param {string} name
		 * @param {function} contr
		 */
		registerReporter: function (name, contr) {
			this._reporterList[name.toLowerCase()] = contr;
		},

		/**
		 * Registers a list of reporters
		 *
		 * @method registerReporterRange
		 * @param {object[]} list Of `{ name: <string>, fn: <function> }`
		 */
		registerReporterRange: function (list) {
			list.forEach(function (entry) {
				this.registerReporter(entry.name, entry.fn);
			}, this);
		},


		/**
		 * Adds a new reporter to the list of active reporters
		 *
		 * @method addReporter
		 * @param {string} name
		 * @param {object} [options]
		 * @return {AbstractReporter}
		 */
		addReporter: function (name, options) {
			var Class = this.getReporter(name), instance;

			if (!Class) {
				throw new Error('Unknown reporter "' + name + '"');
			}

			options = options || {};
			if (!options.type) {
				options.type = name;
			}

			instance = new Class(this.getContainer(), options);
			this.getActiveReporter().push(instance);
			return instance;
		},

		/**
		 * Adds a new reporter to the list of active reporters
		 *
		 * @method addReporterRange
		 * @param {string|string[]|object|object[]} reporter
		 * @return {AbstractReporter[]}
		 */
		addReporterRange: function (reporter) {
			var result = [];

			reporter = this._normalizeReporter(reporter);

			reporter.forEach(function (entry) {
				result.push(this.addReporter(entry.type, entry));
			}, this);

			return result;
		},

		/**
		 * Normalizes the reporter
		 *
		 * @method _normalizeReporter
		 * @param {string|string[]|object|object[]} reporter
		 * @return {object[]}
		 * @private
		 */
		_normalizeReporter: function (reporter) {
			var newReporter, localReporter = reporter;

			// Convert to array
			if (_.isString(localReporter)) {
				localReporter = [localReporter];
			} else if (!_.isArray(localReporter) && _.isObject(localReporter)) {
				localReporter = [localReporter];
			}

			// Format array as needed by the function
			if (_.isArray(localReporter)) {

				newReporter = [];
				localReporter.forEach(function (currentReporter) {

					if (_.isString(currentReporter)) {
						newReporter.push({type: currentReporter});

					} else if (_.isObject(currentReporter)) {
						newReporter.push(currentReporter);
					}
				});
				localReporter = newReporter;
			}

			return localReporter;
		},


		/**
		 * Gets all the active listener
		 *
		 * @method getActiveListener
		 * @return {AbstractListener[]}
		 */
		getActiveListener: function () {
			return this._activeListener || [];
		},

		/**
		 * Gets a dictionary of registered listener
		 *
		 * @method getListenerList
		 * @return {object}
		 */
		getListenerList: function () {
			return this._listenerList || {};
		},


		/**
		 * Checks if a listener is registered
		 *
		 * @method hasListener
		 * @param {string} name
		 * @return {boolean}
		 */
		hasListener: function (name) {
			return !!this.getListenerList()[name.toLowerCase()];
		},

		/**
		 * Gets a specific registered listener
		 *
		 * @method getListener
		 * @param {string} name
		 * @return {function}
		 */
		getListener: function (name) {
			return this.getListenerList()[name.toLowerCase()];
		},

		/**
		 * Registers a listener
		 *
		 * @method registerListener
		 * @param {string} name
		 * @param {function} contr
		 */
		registerListener: function (name, contr) {
			this._listenerList[name.toLowerCase()] = contr;
		},

		/**
		 * Registers a list of listeners
		 *
		 * @method registerListenerRange
		 * @param {object[]} list `{ name: <string>, fn: <function> }`
		 */
		registerListenerRange: function (list) {
			list.forEach(function (entry) {
				this.registerListener(entry.name, entry.fn);
			}, this);
		},


		/**
		 * Adds a new listener to the list of active listeners
		 *
		 * @method addListener
		 * @param {string} name
		 * @param {object} [options]
		 * @return {AbstractListener}
		 */
		addListener: function (name, options) {
			var Class = this.getListener(name), instance;

			if (!Class) {
				throw new Error('Unknown listener "' + name + '"');
			}

			options = options || {};
			if (!options.type) {
				options.type = name;
			}

			instance = new Class(this.getContainer(), options);
			instance.on('message', function (messageType, data) {
				this.processMessage(messageType, data);
			}.bind(this));
			this.getActiveListener().push(instance);
			return instance;
		},

		/**
		 * Adds a new listener to the list of active listeners
		 *
		 * @method addListenerRange
		 * @param {string|string[]|object|object[]} listener
		 * @return {AbstractListener[]}
		 */
		addListenerRange: function (listener) {
			var result = [];

			listener = this._normalizeListener(listener);

			listener.forEach(function (entry) {
				result.push(this.addListener(entry.type, entry));
			}, this);

			return result;
		},

		/**
		 * Normalizes the listener
		 *
		 * @method _normalizeListener
		 * @param {string|string[]|object|object[]} listener
		 * @return {object[]}
		 * @private
		 */
		_normalizeListener: function (listener) {
			var newListener, localListener = listener;

			// Convert to array
			if (_.isString(localListener)) {
				localListener = [localListener];
			} else if (!_.isArray(localListener) && _.isObject(localListener)) {
				localListener = [localListener];
			}

			// Format array as needed by the function
			if (_.isArray(localListener)) {

				newListener = [];
				localListener.forEach(function (currentListener) {

					if (_.isString(currentListener)) {
						newListener.push({type: currentListener});

					} else if (_.isObject(currentListener)) {
						newListener.push(currentListener);
					}
				});
				localListener = newListener;
			}

			return localListener;
		},


		/**
		 * Gets a list of allowed messages
		 *
		 * @method getAllowedMessages
		 * @return {string[]}
		 */
		getAllowedMessages: function () {
			return [
				'start',
				'stop',
				'complete',
				'itemData',
				'itemMessage',
				'suiteStart',
				'suiteEnd',
				'testStart',
				'testFailed',
				'testUndefined',
				'testError',
				'testPassed',
				'testSkipped',
				'testIncomplete'
			];
		},

		/**
		 * Processes a message by sending it to all attached reporter
		 *
		 * @method processMessage
		 * @param {string} messageType
		 * @param {*[]} data
		 */
		processMessage: function (messageType, data) {

			var container = this.getContainer();

			if (this.getAllowedMessages().indexOf(messageType) === -1) {
				throw new Error('The message is not allowed to be relayed to the reporter. "' + messageType + '"');
			}

			// Send to container
			if (this.shouldCollect()) {
				container[messageType].apply(container, data);
			}

			// Send to reporter
			this.getActiveReporter().forEach(function (reporter) {
				reporter[messageType].apply(reporter, data);
			});
		},

		/**
		 * Returns a convenience object to trigger messages
		 *
		 * @method message
		 * @return {Event}
		 */
		message: function () {
			return this._messageEvent;
		},


		/**
		 * Parses a string to see if any listener can receive messages from it
		 *
		 * @method parse
		 * @param {string} text
		 * @param {object} [placeholder]
		 * @return {string}
		 */
		parse: function (text, placeholder) {
			var localText = text;

			this.getActiveListener().forEach(function (listener) {
				localText = listener.parse(localText, placeholder);
			});

			return localText;
		},

		/**
		 * Loads a reporter hook and returns the system specific function to be supplied to the system
		 *
		 * @method loadHook
		 * @param {string} type
		 * @param {string|undefined} reportId
		 * @param {function} [finishedCallback]
		 * @return {function}
		 */
		loadHook: function (type, reportId, finishedCallback) {
			var hooks = ReportManager.getReporterHooks();

			if (hooks.hasOwnProperty(type)) {
				return hooks[type](this, reportId, finishedCallback);
			} else {
				throw new Error('Unknown reporter hook ' + type);
			}
		},


		/**
		 * Clears all run-data
		 *
		 * @method clear
		 */
		clear: function () {
			if (this.shouldCollect()) {
				this._container = new ReportContainer();
			}
			this._activeReporter = [];
			this._activeListener = [];
		}
	},

	{
		/**
		 * @var string
		 */
		TYPE: 'ReportManager'
	}
);


// Make abstract classes available to external project
/**
 * @property AbstractListener
 * @type {AbstractListener}
 * @static
 */
ReportManager.AbstractListener = AbstractListener;

/**
 * @property AbstractMessenger
 * @type {AbstractMessenger}
 * @static
 */
ReportManager.AbstractMessenger = AbstractMessenger;

/**
 * @property AbstractReporter
 * @type {AbstractReporter}
 * @static
 */
ReportManager.AbstractReporter = AbstractReporter;

/**
 * @property AbstractLoader
 * @type {AbstractLoader}
 * @static
 */
ReportManager.AbstractLoader = AbstractLoader;


/**
 * Gets a list of messengers
 *
 * @static
 * @method getMessengers
 * @return {object}
 */
ReportManager.getMessengers = function () {
	return {
		"jenkinssaucelabs": require('./messenger/jenkinsSauceLabs'),
		"teamcity": require('./messenger/teamCity'),
		"preceptor": require('./messenger/preceptor')
	};
};

/**
 * Gets a list of loaders
 *
 * @static
 * @method getLoaders
 * @return {object}
 */
ReportManager.getLoaders = function () {
	return {
		"junit": require('./loader/junit'),
		"tap": require('./loader/tap'),
		"istanbul": require('./loader/istanbul')
	};
};

/**
 * Gets a list of reporter-hooks
 *
 * @static
 * @method getReporterHooks
 * @return {object}
 */
ReportManager.getReporterHooks = function () {
	return {
		"cucumber": require('./reporterHooks/cucumber'),
		"mocha": require('./reporterHooks/mocha')
	};
};


/**
 * Gets the module version
 *
 * @static
 * @method version
 * @return {string}
 */
ReportManager.version = require('../package.json').version;


module.exports = ReportManager;
