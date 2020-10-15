Kobold-Core
===========

Core library for shared objects of the Kobold testing framework.

[![Build Status](https://img.shields.io/travis/yahoo/kobold-core.svg)](http://travis-ci.org/yahoo/kobold-core)
[![Coveralls Coverage](https://img.shields.io/coveralls/yahoo/kobold-core.svg)](https://coveralls.io/r/yahoo/kobold-core)
[![Code Climate Grade](https://img.shields.io/codeclimate/github/yahoo/kobold-core.svg)](https://codeclimate.com/github/yahoo/kobold-core)

[![NPM version](https://badge.fury.io/js/kobold-core.svg)](https://www.npmjs.com/package/kobold-core)
[![NPM License](https://img.shields.io/npm/l/kobold-core.svg)](https://www.npmjs.com/package/kobold-core)

[![NPM](https://nodei.co/npm/kobold-core.png?downloads=true&stars=true)](https://www.npmjs.com/package/kobold-core)
[![NPM](https://nodei.co/npm-dl/kobold-core.png?months=3&height=2)](https://www.npmjs.com/package/kobold-core)

[![Coverage Report](https://img.shields.io/badge/Coverage_Report-Available-blue.svg)](http://yahoo.github.io/kobold-core/coverage/lcov-report/)
[![API Documentation](https://img.shields.io/badge/API_Documentation-Available-blue.svg)](http://yahoo.github.io/kobold-core/docs/)

[![Gitter Support](https://img.shields.io/badge/Support-Gitter_IM-yellow.svg)](https://gitter.im/preceptorjs/support)

**Table of Contents**
* [Installation](#installation)
* [Usage](#usage)
    * [Storage Adapter](#storage-adapter)
        * [File Storage Adapter](#file-storage-adapter)
        * [Key-Value Storage Adapter](#key-value-storage-adapter)
    * [Connection Adapter](#connection-adapter)
        * [Riak Connection Adapter](#riak-connection-adapter)
* [API-Documentation](#api-documentation)
* [Tests](#tests)
* [Third-party libraries](#third-party-libraries)
* [License](#license)


##Installation

Install this module with the following command:
```shell
npm install kobold-core
```

Add the module to your ```package.json``` dependencies:
```shell
npm install --save kobold-core
```
Add the module to your ```package.json``` dev-dependencies:
```shell
npm install --save-dev kobold-core
```

Require the module in your source-code:
```javascript
var core = require('kobold-core');
```

##Usage

The module exposes 2 major components:
* Storage Adapter
* Connection Adapter

###Storage Adapter

There are two storage adapter available:
* FileStorageAdapter (```file```)
* KeyValueStorageAdapter (```KeyValue```)

These adapters can be accessed through the ```storageAdapters``` property:
```javascript
var FileStorageAdapter = core.storageAdapters.file;
```

A build function is available to create and configure a storage adapter:
```javascript
var storageAdapter = core.buildStorageAdapter('build1', {
	type: '...'
});
```

An abstract storage adapter is exposed to implement additional plugins:
```javascript
var StoragePlugin = core.StorageAdapter.extend({
	// Implementation
});
``` 

####File Storage Adapter

This storage adapter uses the local filesystem to manage screens.
```javascript
var fileStorageAdapter = core.buildStorageAdapter('build1', {
	type: 'File',
	options: {
		path: 'path/to/screens'
	}
});
```

####Key-Value Storage Adapter

The Key-Value storage adapter manages screens on a key-value storage system.
```javascript
var keyValueStorageAdapter = core.buildStorageAdapter('build1', {
	type: 'KeyValue',
	connection: connectionAdapter,
	options: {
		company: '<company-id>',
		department: '<department-id>',
		project: '<project-id>',
		job: '<job-id>'
	}
});
```

###Connection Adapter

Currently, only one connection adapter is available:
* RiakConnectionAdapter (```Riak```)

These adapters can be accessed through the ```connectionAdapters``` property:
```javascript
var RiakConnectionAdapter = core.connectionAdapters.Riak;
```

A build function is available to create and configure a connection adapter:
```javascript
var riakStorageAdapter = core.buildConnectionAdapter({
	type: 'Riak',
	options: {
		host: 'www.example.org'
	}
});
```

An abstract connection adapter is exposed to implement additional plugins:
```javascript
var ConnectionPlugin = core.ConnectionAdapter.extend({
	// Implementation
});
``` 

####Riak Connection Adapter

This adapter can be supplied to the Key-Value storage adapter to save the screens in a Riak grid.
```javascript
var riakStorageAdapter = core.buildConnectionAdapter({
	type: 'Riak',
	options: {
		host: 'www.example.org'
	}
});

var keyValueStorageAdapter = core.buildStorageAdapter('build1', {
	type: 'KeyValue',
	connection: riakStorageAdapter,
	options: {
		company: '<company-id>',
		department: '<department-id>',
		project: '<project-id>',
		job: '<job-id>'
	}
});
```

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
* blink-diff: https://github.com/yahoo/blink-diff
* pngjs-image: https://github.com/yahoo/pngjs-image
* preceptor-core: https://github.com/yahoo/preceptor-core
* promise: https://github.com/then/promise
* request: https://github.com/mikeal/request
* uuid: https://github.com/shtylman/node-uuid

###Dev-Dependencies
* chai: http://chaijs.com
* coveralls: https://github.com/cainus/node-coveralls
* istanbul: https://github.com/gotwarlost/istanbul
* mocha: https://github.com/visionmedia/mocha
* perceptualdiff: https://github.com/marcelerz/node-perceptualdiff
* sinon: http://cjohansen.no/sinon/
* sinon-chai: https://github.com/domenic/sinon-chai
* yuidocjs: https://github.com/yui/yuidoc

##License

The MIT License

Copyright 2014 Yahoo Inc.
