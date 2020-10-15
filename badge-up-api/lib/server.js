/*
Copyright (c) 2016, Yahoo Inc.
Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

var express = require('express'),
    bodyParser = require('body-parser'),
    badger = require('badge-up'),
    path = require('path'),
    MATCH_COLOR = /^[a-fA-F0-9]{3}(|[a-fA-F0-9]{3})$/;

/**
 * Get the Hex color based on the input from the user
 *  - Named value from BadgeUp
 *  - Hex color 3 or 6 digits
 *  - Default black
 * @method getHexColor
 * @param  {String}    colorName String from the user
 * @return {String}              Hex color to display
 */
function getHexColor(colorName) {
    var color = '#000';

    if (badger.colors[colorName]) {
        color = badger.colors[colorName];
    } else if (MATCH_COLOR.test(colorName)) {
        color = '#' + colorName;
    }

    return color;
}

/**
 * Generate the routes for V1 API
 * @method routerApiVOne
 * @return {Router}      Express Router with appropriate routes
 */
function routerApiVOne() {
    var api = express.Router({caseSensitive: true});

    api.get('/status', function (request, response) {
        response.json({
            'status': 'OK'
        });
    });

    api.get('/colors', function (request, response) {
        response.json({
            colors: Object.keys(badger.colors)
        });
    });

    api.get('/:label/:value/:color', function (request, response) {
        var color = getHexColor(request.params.color);

        console.log('View Badge: Label=%s Value=%s Color=%s', request.params.label, request.params.value, color);
        badger(request.params.label, request.params.value, color, function (error, data) {
            response.status(200).type('svg').send(data);
        });
    });

    return api;
}

/**
 * Start the Server
 * @method setup
 * @param  {Object}   config        Server configuration
 * @param  {Integer}  [config.port] Port to bind to (default 4080)
 * @param  {Function} callback      Function to call when done (error, HTTPServer)
 */
function setup(config, callback) {
    var app = express(),
        port = config.port || 4080,
        server,
        staticAssetsPath = path.join(__dirname, '..', 'public');

    app.use(bodyParser.urlencoded({
        extended: true  // for use with 'qs' library
    }));
    app.use(bodyParser.json());
    app.use('/v1', routerApiVOne());
    app.use(express.static(staticAssetsPath));

    server = app.listen(port, function () {
        if (callback) {
            callback(null, server);
        }
    });
}

module.exports = setup;
