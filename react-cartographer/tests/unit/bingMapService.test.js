/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/* jshint unused:vars */
/* global describe, it, expect */

'use strict';

import {expect} from 'chai';
import BingMapService from '../../src/lib/bingMap';

describe('BingMapService', () => {
    const service = new BingMapService();

    it('#name is "bing"', () => {
        expect(service.name).to.equal('bing');
    });

    describe('#read', () => {
        it('should return the correct locationLink and locationText', () => {
            const result = service.getMap({
                mapId: 'mapId',
                line1: 'line1',
                line2: 'line2',
                line3: 'line3',
                width: 200,
                height: 300,
                providerKey: 'key'
            });

            expect(result.data.locationText).to.equal('line1,line2,line3');
            expect(result.data.locationLink).to.equal('https://dev.virtualearth.net/REST/V1/Imagery/Map/Road/' +
                'line1%2Cline2%2Cline3?mapSize=200%2C300&key=key');
        });
    });
});
