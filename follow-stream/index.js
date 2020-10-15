/*
Copyright 2015, Yahoo Inc.
Code licensed under the MIT License.
See LICENSE.txt
*/

var Readable = require('stream').Readable;
var follow = require('follow');
var followRegistry = require('follow-registry');

function makeStream () {
    var strm = new Readable({objectMode: true});
    strm._read = noop;
    return strm;
}

function noop () {}

function followStream(opts){
    var strm = makeStream();

    follow(opts, function(err, change){
        if (err) {
            // need nextTick since otherwise error handler won't be added
            return process.nextTick(function(){
                strm.emit('error', err);
            });
        }
        strm.push(change);
    });

    return strm;
}
exports.follow = followStream;

function followRegistryStream(opts) {
    opts = opts || {};
    var strm = makeStream();

    opts.handler = function(data, cb){
        strm.push(data);
        cb();
    };
    followRegistry(opts);

    return strm;
}
exports.followRegistry = followRegistryStream;
