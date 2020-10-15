/*
Copyright (c) 2016, Yahoo Inc.
Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

/* global describe, it, beforeEach, afterEach */
var assert = require('chai').assert,
    mockery = require('mockery'),
    path = require('path'),
    badgerMock = require('./mocks/badge-up-mock'),
    testData = require('./testData'),
    testUtils = require('./utils');

describe('server', function () {
    beforeEach(function (done) {
        var me = this;

        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerMock('badge-up', badgerMock.generateMock());

        require('../lib/server')({}, function (error, app) {
            me.app = app;
            done();
        });
    });

    afterEach(function (done) {
        mockery.deregisterAll();
        mockery.disable();

        if (this.app) {
            this.app.close();
            done();
        } else {
            done();
        }
    });

    it('should create a server app, as a sanity test', function () {});

    describe('status', function () {
        it('should serve a simple status page', function (done) {
            var data;

            testUtils.getRequest({
                endpoint: '/status',
                expectedStatusCode: 200
            }, function (body) {
                data = JSON.parse(body);
                assert.deepEqual(data, {status: 'OK'});
                done();
            });

        });
    });

    describe('colors', function () {
        it('should return list of available colors', function (done) {
            var data;

            testUtils.getRequest({
                endpoint: '/colors',
                expectedStatusCode: 200
            }, function (body) {
                data = JSON.parse(body);
                assert.deepEqual(data, {colors: ['red','green','blue']});
                done();
            });
        });
    });

    describe('badge', function () {
        it('should default to black', function (done) {
            var expected = {
                    label: 'leftLabel',
                    value: 'rightValue',
                    color: 'maroon'
                },
                badgeUp = badgerMock.accessMock();

            badgeUp.withArgs(expected.label, expected.value, '#000').yieldsAsync(null, testData.badgeUpData);

            testUtils.getRequest({
                endpoint: path.join('/', expected.label, expected.value, 'maroon'),
                expectedStatusCode: 200,
                expectedType: 'svg'
            }, function (body) {
                assert.strictEqual(body, testData.badgeUpData);

                badgeUp.verify();
                done();
            });
        });

        it('should support hex colors', function (done) {
            var expected = {
                    label: 'leftLabel',
                    value: 'rightValue',
                    color: 'ff00ff'
                },
                badgeUp = badgerMock.accessMock();

            badgeUp.withArgs(expected.label, expected.value, '#ff00ff').yieldsAsync(null, testData.badgeUpData);

            testUtils.getRequest({
                endpoint: path.join('/', expected.label, expected.value, expected.color),
                expectedStatusCode: 200,
                expectedType: 'svg'
            }, function (body) {
                assert.strictEqual(body, testData.badgeUpData);

                badgeUp.verify();
                done();
            });
        });

        it('should serve a badge', function (done) {
            var expected = {
                    label: 'leftLabel',
                    value: 'rightValue',
                    color: 'green'
                },
                badgeUp = badgerMock.accessMock();

            badgeUp.withArgs(expected.label, expected.value, '#0F0').yieldsAsync(null, testData.badgeUpData);

            testUtils.getRequest({
                endpoint: path.join('/', expected.label, expected.value, expected.color),
                expectedStatusCode: 200,
                expectedType: 'svg'
            }, function (body) {
                assert.strictEqual(body, testData.badgeUpData);

                badgeUp.verify();
                done();
            });
        });
    });

    describe('ui', function () {
        it('should serve a html page', function (done) {
            var request = require('request');
            request.get('http://localhost:4080', function (error, response, body) {
                assert.isNull(error);
                assert.strictEqual(response.statusCode, 200);
                assert.include(response.headers['content-type'], 'text/html');

                done();
            });
        });
    });
});
