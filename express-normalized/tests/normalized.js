/* global describe, it */
'use strict';

var chai = require('chai'),
    assert = chai.assert,
    pathlib = require('path'),
    normalize = require(pathlib.join(__dirname, '../normalized.js'));

describe('express-normalized', function () {

    it('normalize should return a function.', function () {
        assert.isFunction(normalize);
    });

    it('should create an empty object if given no data', function() {
        var req = { body: {}, query: {} };
        normalize()(req, {}, function() {
            assert.ok(req.normalized);
            assert.equal(Object.keys(req.normalized).length, 0);
        });
    });

    it('should create an object if given query', function() {
        var req = { body: {}, query: { foo: true } };
        normalize()(req, {}, function() {
            assert.ok(req.normalized);
            assert.equal(Object.keys(req.normalized).length, 1);
            assert.equal(req.normalized.foo, true);
        });
    });

    it('should create an object if given body', function() {
        var req = { body: { bar: true }, query: {} };
        normalize()(req, {}, function() {
            assert.ok(req.normalized);
            assert.equal(Object.keys(req.normalized).length, 1);
            assert.equal(req.normalized.bar, true);
        });
    });

    it('should create a mixed object if given body and query of different keys', function() {
        var req = { body: { bar: true }, query: { foo: true } };
        normalize()(req, {}, function() {
            assert.ok(req.normalized);
            assert.equal(Object.keys(req.normalized).length, 2);
            assert.equal(req.normalized.bar, true);
            assert.equal(req.normalized.foo, true);
            assert.isUndefined(req.query.bar);
            assert.isUndefined(req.body.foo);
        });
    });

    it('should create a mixed object if given body and query of matching keys', function() {
        var req = { body: { bar: true, baz: 'two' }, query: { foo: true, baz: 'one' } };
        normalize()(req, {}, function() {
            assert.ok(req.normalized);
            assert.equal(Object.keys(req.normalized).length, 3);
            assert.equal(req.normalized.bar, true);
            assert.equal(req.normalized.foo, true);
            assert.equal(req.normalized.baz, 'two');
        });
    });

    it('should create a mixed object if given body and query of matching keys - with config', function() {
        var req = { bodies: { bar: true, baz: 'two' }, queries: { foo: true, baz: 'one' } };
        normalize({
            base: 'normal',
            get: 'queries',
            post: 'bodies'
        })(req, {}, function() {
            assert.ok(req.normal);
            assert.equal(Object.keys(req.normal).length, 3);
            assert.equal(req.normal.bar, true);
            assert.equal(req.normal.foo, true);
            assert.equal(req.normal.baz, 'two');
        });
    });

});

