express-normalized
==================

Similar to PHP's `$_REQUEST` object, this mixes the `GET` vars and `POST` vars into a normalized `Object` always choosing `POST` over `GET`.

By default it creates a new `Object`, then walks the `req.query` and adds the `key/value` to it, then it will walk the `req.body` and do the same.
It will always use the `POST` version of the value if it is available. It will then add this new `Object` to the `req` as `normalized`. See the `configuration` section
below for changing these values.

[![npm Version](https://img.shields.io/npm/v/express-normalized.svg?style=flat-square)](https://www.npmjs.org/package/express-normalized)
[![Build Status](http://img.shields.io/travis/yahoo/express-normalized.svg?style=flat-square)](https://travis-ci.org/yahoo/express-normalized)

usage
-----

```js

var app = express(),
    normalized = require('express-normalized');

//Add your normalize handlers for get/post here
//busboy, body-parser, etc

app.use(normalized());

//Then in your app:

function(req, res) {
    console.log(req.normalized);
}
```

configuration
-------------

You can configure where it get's the `GET` & `POST` from as well as the namespace that it applies it to:

```js
var app = express(),
    normalized = require('express-normalized');

//Add your normalize handlers for get/post here
//busboy, body-parser, etc

//Maybe you are using a custom variable parser and it uses
// queries as get vars and bodies as post vars
// and you want it to populate the req.normal variable

app.use(normalized({
    base: 'normal',
    get: 'queries',
    post: 'bodies'
}));

//Then in your app:

function(req, res) {
    console.log(req.normal);
}
```

