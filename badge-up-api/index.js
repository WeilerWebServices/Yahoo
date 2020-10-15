/*
Copyright (c) 2016, Yahoo Inc.
Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

require('./lib/server')({}, function (error, server) {
    if (error) {
        console.error('Failure starting application', error);
        process.exit(1);
    }
    console.log('Running at http://127.0.0.1:' + server.address().port);
});
