var mockery = require('mockery');
var assert = require('assert');
var followOpts;
var followRegistryOpts;
describe('follow-stream', function(){
    before(function(){
        mockery.registerMock('follow', function(opts, cb){
            followOpts = opts;
            if (opts === 'fail') {
                cb(new Error('fail'));
            }
            for (var i = 4; i; i--) {
                cb(null, 'some data ' + i);
            }
        });
        mockery.registerMock('follow-registry', function(opts){
            followRegistryOpts = opts;
            for (var i = 4; i; i--) {
                opts.handler('some data ' + i, function(){});
            }
        });
        mockery.enable({
            warnOnUnregistered: false
        });
    });
    it('follow', function(done){
        var opts = {};
        var strm = require('../index').follow(opts);
        assert(strm.readable);
        var data = [];
        strm.on('data', function(d) {
            data.push(d);
        });
        setImmediate(function(){
            assert.deepEqual([
                'some data 4',
                'some data 3',
                'some data 2',
                'some data 1'
            ], data);
            assert.strictEqual(followOpts, opts);
            done();
        });
    });
    it('follow fail', function(done){
        require('../index').follow('fail').on('error', function(e){
            assert.equal(e.message, 'fail');
            done();
        });
    });
    it('followRegistry', function(done){
        var opts = {};
        var strm = require('../index').followRegistry(opts);
        assert(strm.readable);
        var data = [];
        strm.on('data', function(d) {
            data.push(d);
        });
        setImmediate(function(){
            assert.deepEqual([
                'some data 4',
                'some data 3',
                'some data 2',
                'some data 1'
            ], data);
            assert.strictEqual(followRegistryOpts, opts);
            done();
        });
    });
});
