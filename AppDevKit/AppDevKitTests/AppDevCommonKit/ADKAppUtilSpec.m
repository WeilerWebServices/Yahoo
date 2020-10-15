//
//  ADKAppUtilSpec.m
//  AppDevKit
//
//  Created by Wei-Hon (Plasma) Chen on 6/10/14.
//  Copyright © 2014, Yahoo Inc.
//  Licensed under the terms of the BSD License.
//  Please see the LICENSE file in the project root for terms.
//

#import <Kiwi/Kiwi.h>

#import "ADKAppUtil.h"
#import "ADKCalculatorHelper.h"
#import "ADKStringHelper.h"
#import "TimeTestUtils.h"
#import "ViewTestUtil.h"
#import <CoreLocation/CoreLocation.h>

#pragma mark - ADKAppUtil

SPEC_BEGIN(ADKAppUtilSpec)

describe(@"test ADKIsLongerScreen", ^{
    it(@"device is iPhone 4s", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 320.0f, 480.0f);

        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beNo];
    });
    
    it(@"device is iPhone 5", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 320.0f, 568.0f);
        
        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beYes];
    });
    
    it(@"device is iPhone 6", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 375.0f, 667.0f);
        
        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beYes];
    });
    
    it(@"device is iPhone 6s", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 414.0f, 736.0f);
        
        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beYes];
    });
    
    it(@"device is iPad", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 768.0f, 1024.0f);
        
        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beNo];
    });
    
    it(@"device is iPad pro", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 1536.0f, 2048.0f);
        
        // stub bounds
        [[UIScreen mainScreen] stub:@selector(bounds) andReturn:theValue(rectBounds)];
        // stub fixedCoordinateSpace
        id coordinateSpaceMock = [KWMock mockForProtocol:@protocol(UICoordinateSpace)];
        [coordinateSpaceMock stub:@selector(bounds) andReturn:theValue(rectBounds)];
        [[UIScreen mainScreen] stub:@selector(fixedCoordinateSpace) andReturn:theValue(coordinateSpaceMock)];
        
        [[theValue(ADKIsLongerScreen()) should] beNo];
    });
});

describe(@"test ADKIsWideScreen", ^{
    it(@"device is iPhone 4s", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 320.0f, 480.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beNo];
    });
    
    it(@"device is iPhone 5", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 320.0f, 568.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beNo];
    });
    
    it(@"device is iPhone 6", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 375.0f, 667.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beYes];
    });
    
    it(@"device is iPhone 6s", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 414.0f, 736.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beYes];
    });
    
    it(@"device is iPad", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 768.0f, 1024.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beYes];
    });
    
    it(@"device is iPad pro", ^{
        CGRect rectBounds = CGRectMake(0.0f, 0.0f, 1536.0f, 2048.0f);
        
        // stub bounds
        [ViewTestUtil stubMainScreenBoundsWithRect:rectBounds];
        
        BOOL isWideScreen = ADKIsWideScreen();
        [[theValue(isWideScreen) should] beYes];
    });
});

describe(@"Test ADKIsBelowIOS7", ^{
    context(@"For different version", ^{
        it(@"with version iOS 7", ^{
            [[theValue(ADKIsBelowIOS7()) should] equal:theValue(NO)];
        });
    });
});
describe(@"Test ADKIsBelowIOS8", ^{
    context(@"For different version", ^{
        it(@"with version iOS 8", ^{
            [[theValue(ADKIsBelowIOS8()) should] equal:theValue(NO)];
        });
    });
});

describe(@"Test ADKIsBelowIOS9", ^{
    context(@"For different version", ^{
        it(@"with version iOS 9", ^{
            [[theValue(ADKIsBelowIOS9()) should] equal:theValue(NO)];
        });
    });
});

describe(@"Test ADKIsBelowIOS10", ^{
    context(@"For different version", ^{
        it(@"with version iOS 10", ^{
            [[theValue(ADKIsBelowIOS10()) should] equal:theValue(NO)];
        });
    });
});

describe(@"Test ADKIsLocationServicesAvailableOrNotDetermined", ^{
    context(@"For different status", ^{
        beforeEach(^{
            [CLLocationManager stub:@selector(locationServicesEnabled) andReturn:theValue(YES)];
        });
        it(@"when status is kCLAuthorizationStatusAuthorizedAlways", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusAuthorizedAlways)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(YES)];
        });
        it(@"when status is kCLAuthorizationStatusAuthorizedWhenInUse", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusAuthorizedWhenInUse)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(YES)];
        });
        it(@"when status is kCLAuthorizationStatusNotDetermined", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusNotDetermined)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(YES)];
        });
        it(@"when status is kCLAuthorizationStatusDenied", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusDenied)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusRestricted", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusRestricted)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
    });
    context(@"For location is disabled", ^{
        beforeEach(^{
            [CLLocationManager stub:@selector(locationServicesEnabled) andReturn:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusAuthorizedAlways", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusAuthorizedAlways)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusAuthorizedWhenInUse", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusAuthorizedWhenInUse)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusNotDetermined", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusNotDetermined)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusDenied", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusDenied)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
        it(@"when status is kCLAuthorizationStatusRestricted", ^{
            [CLLocationManager stub:@selector(authorizationStatus) andReturn:theValue(kCLAuthorizationStatusRestricted)];
            [[theValue(ADKIsLocationServicesAvailableOrNotDetermined()) should] equal:theValue(NO)];
        });
    });
});

// We're using iPhone 6 as a test device. Please refer to below device specs.
// https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/Displays/Displays.html
// iPhone 6's screen size is 375 x 667 and screen ratio should be 0.5622188905547226.
describe(@"Test ADKPortraitScreenRatio", ^{
    it(@"with iPhone6", ^{
        [[theValue(ADKPortraitScreenRatio()) should] equal:theValue(0.5622188905547226)];
    });
});

describe(@"Test ADKPortraitScreenSize", ^{
    it(@"with iPhone6", ^{
        CGSize expectedSize = CGSizeMake(375.0f, 667.0f);
        [[theValue(ADKPortraitScreenSize()) should] equal:theValue(expectedSize)];
    });
});

describe(@"Test ADKPortraitScreenBoundRect", ^{
    it(@"with iPhone6", ^{
        CGRect expectedFrame = CGRectMake(0.0f, 0.0f, 375.0f, 667.0f);
        [[theValue(ADKPortraitScreenBoundRect()) should] equal:theValue(expectedFrame)];
    });
});

SPEC_END


#pragma mark - ADKStringHelper

SPEC_BEGIN(ADKStringHelperSpec)

// The date is Tue Jun 10 16:04:32 CST 2014

static NSInteger s_testTimeStamp = 1402387472;
describe(@"test getFullFormatTimeString:NSDate*", ^{
    
    beforeEach(^{
        [TimeTestUtils setTaipeiTimezone];
    });
    
    it(@"with testTimeStamp", ^{
        NSString *dateString = ADKGetFullFormatTimeString([NSDate dateWithTimeIntervalSince1970:s_testTimeStamp]);
        [[dateString should] equal:@"2014/06/10 16:04"];
    });
});

describe(@"test getSimpleFormatTimeString:NSDate*", ^{
    
    beforeEach(^{
        [TimeTestUtils setTaipeiTimezone];
    });
    
    it(@"with 2014/Jun/10 ", ^{
        NSString *dateString = ADKGetSimpleFormatTimeString([NSDate dateWithTimeIntervalSince1970:s_testTimeStamp]);
        [[dateString should] equal:@"2014/06/10"];
    });
});

describe(@"test getThousandSeparatorNumberString", ^{
    it(@"with 1234", ^{
        NSString *numString = ADKGetThousandSeparatorNumberString(1234);
        [[numString should] equal:@"1,234"];
    });
});

SPEC_END

#pragma mark - ADKCalculatorHelper

SPEC_BEGIN(ADKCalculatorHelperSpec)

describe(@"test ADKRandomFloatnumber",^{
    it(@"with two float numbers",^{
        [[@(ADKRandomFloatNumber(60.0f, 0.0f)) should] beBetween:@(0.0f) and:@(60.0f)];
    });
});

describe(@"test firstNonEmptyString(NSArray *)", ^{
    it(@"with two strings", ^{
        NSString *result = ADKFirstNonEmptyString(2, @"hi", @"there");
        [[result should] equal:@"hi"];
    });

    it(@"with one empty string, one nil, and one string", ^{
        NSString *result = ADKFirstNonEmptyString(3, @"", nil, @"value");
        [[result should] equal:@"value"];
    });

    it(@"with 2 strings and 1 nil in the middle", ^{
        NSString *result = ADKFirstNonEmptyString(3, @"skip", nil, @"value");
        [[result should] equal:@"skip"];
    });

    it(@"with nil and one string", ^{
        NSString *result = ADKFirstNonEmptyString(2, nil, @"there");
        [[result should] equal:@"there"];
    });

    it(@"with two nils", ^{
        NSString *result = ADKFirstNonEmptyString(2, nil, nil);
        [[result should] equal:@""];
    });
});

describe(@"test getDateCompareDescriptionWithDate", ^{
    beforeEach(^{
        [TimeTestUtils setTaipeiTimezone];
    });
    
    it(@"with time interval since now is 130 seconds", ^{
        NSString *expected = @"2 分鐘後";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:130]);
        [[compareDateString should] equal:expected];
    });
    
    it(@"with time interval since now is -130 seconds", ^{
        NSString *expected = @"2 分鐘前";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:-130]);
        [[compareDateString should] equal:expected];
    });
    
    it(@"with time interval since now is 3800 seconds", ^{
        NSString *expected = @"1 小時後";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:3800]);
        [[compareDateString should] equal:expected];
    });
    
    it(@"with time interval since now is -10900 seconds", ^{
        NSString *expected = @"3 小時前";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:-10900]);
        [[compareDateString should] equal:expected];
    });
    
    it(@"with time interval since now is 345700 seconds", ^{
        NSString *expected = @"4 天後";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:345700]);
        [[compareDateString should] equal:expected];
    });
    
    it(@"with time interval since now is -86500 seconds", ^{
        NSString *expected = @"1 天前";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSinceNow:-86500]);
        [[compareDateString should] equal:expected];

    });
    
    // 2014-05-22 21:38:18 +0000
    it(@"with time stamp 1400794698 seconds", ^{
        NSString *expected = @"05/23";
        NSString *compareDateString = ADKGetDateCompareDescriptionWithDate([NSDate dateWithTimeIntervalSince1970:1400794698]);
        [[compareDateString should] equal:expected];
    });
});

SPEC_END
