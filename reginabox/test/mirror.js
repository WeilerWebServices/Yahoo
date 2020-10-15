var rimraf = require('rimraf');
var ncp = require('ncp');
var request = require('request');
var fs = require('fs');
var mockery = require('mockery');
var path = require('path');
var assert = require('assert');

var regDir = path.join(__dirname, 'registry');

describe('mirror', function(){
    var mirror, port, spawnArgs, createAdArgs, startedMdns;
    this.timeout(10000);
    before(function(done){
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true,
            warnOnReplace: false
        });
        mockery.registerMock('davlog', {
            init: function(){},
            info: function(){}
        });
        mockery.registerMock('child_process', {
            spawn: function(){
                spawnArgs = [].slice.call(arguments);
                return {};
            }
        });
        mockery.registerMock('mdns', {
            tcp: function(type){
                return "TYPE:"+type;
            },
            createAdvertisement: function() {
                createAdArgs = [].slice.call(arguments);
                return {
                    start: function(){
                        startedMdns = true;
                    }
                };
            }
        });
        rimraf(path.join(regDir, 'foobartestthing'), function(){
            process.argv[3] = 'test/registry'
            mirror = require('../lib/mirror');
            ncp(path.join(__dirname, 'foobartestthing'), path.join(__dirname, 'registry', 'foobartestthing'), function(){
                setTimeout(function(){
                    port = mirror.port;
                    done();
                }, 500); // waiting for server to spin up
            });
        });
    });
    after(function(done){
        rimraf(path.join(regDir, 'foobartestthing'), function(){
            mirror.close();
            mockery.deregisterAll();
            mockery.disable();
            done();
        });
    });

    it('should be running registry-static', function(){
        assert.deepEqual(spawnArgs, [
            path.resolve(require.resolve('registry-static'), '../../bin/registry-static'),
            ['-o', 'test/registry', '-d', 'localhost'],
            {stdio: 'inherit'}
        ]);
    });

    it('should avertise on mdns', function(){
        assert.deepEqual(createAdArgs, ['TYPE:reginabox', port]);
        assert(startedMdns);
    });

    it('should serve up main index.json', function(done){
        request.get('http://127.0.0.1:'+port, {json: true}, function(err, res, body){
            assert.ifError(err);
            assert.equal(res.headers.server, 'reginabox');
            assert.equal(res.statusCode, 200);
            assert.equal(body, 'Welcome\n');
            done();
        });
    });

    it('should serve up static files from registry', function(done){
        request.get('http://127.0.0.1:'+port+'/foobartestthing/thing.txt', function(err, res, body){
            assert.ifError(err);
            assert.equal(res.headers.server, 'reginabox');
            assert.equal(res.statusCode, 200);
            assert.equal(body, 'test stuff\n');
            done();
        });
    });

    it('should serve up package index.json, and modify the tarball', function(done){
        request.get('http://127.0.0.1:'+port+'/foobartestthing/', {json: true}, function(err, res, body){
            assert.ifError(err);
            assert.equal(res.headers.server, 'reginabox');
            assert.equal(res.statusCode, 200);
            assert.deepEqual(body, {testing: 'json'});
            done();
        });
    });
});
