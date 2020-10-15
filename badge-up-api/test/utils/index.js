/*
Copyright (c) 2016, Yahoo Inc.
Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

var assert = require('chai').assert,
    request = require('request'),
    C = {
        'HOST_PREFIX': 'http://localhost:4080/v1'
    };

function httpGetRequest(options, callback) {
    var endpoint = options.endpoint,
        expectedStatusCode = options.expectedStatusCode,
        expectedType = options.expectedType;

    request.get(C.HOST_PREFIX + endpoint, function (error, response, body) {
        assert.isNull(error);

        if (expectedStatusCode) {
            assert.strictEqual(response.statusCode, expectedStatusCode);
        }

        if (expectedType) {
            assert.include(response.headers['content-type'], expectedType);
        }

        callback(body);
    });
}

module.exports = {
    getRequest: httpGetRequest
};
