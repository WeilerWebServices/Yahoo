/*
* Copyright 2015, Yahoo Inc.
* Licensed under the MIT License.
* See LICENSE file for details
*/
/*jshint forin: false*/
'use strict';

var normalize = function(options) {
    options = options || {};
    var base = options.base || 'normalized',
        post = options.post || 'body',
        get = options.get || 'query';

    return function(req, res, next) {
        var normal = Object.create(null),
            i, body = req[post], query = req[get];

        for (i in query) {
            normal[i] = query[i];
        }

        for (i in body) {
            normal[i] = body[i];
        }

        req[base] = normal;

        next();
    };
};

module.exports = normalize;
