/*
Copyright (c) 2016, Yahoo Inc.
Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

var sinon = require('sinon'),
    testData = require('../testData'),
    mock;

function accessMock() {
    return mock || generateMock();
}

function generateMock() {
    mock = sinon.mock();
    mock.colors = {
        'red': '#F00',
        'green': '#0F0',
        'blue': '#00F'
    };
    return mock;
}

module.exports = {
    accessMock: accessMock,
    generateMock: generateMock
};
