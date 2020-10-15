//
//  OpenGLRenderViewController.m
//  AppDevKit
//
//  Created by  Chih Feng Sung on 12/13/18.
//  Copyright © 2018 Yahoo. All rights reserved.
//  Licensed under the terms of the BSD License.
//  Please see the LICENSE file in the project root for terms.
//

#import "OpenGLRenderViewController.h"
#import "AppDevCameraKit.h"

@interface OpenGLRenderViewController ()

@property (strong, nonatomic) ADKOpenGLImageView *openGLImageView;
@property (weak, nonatomic) IBOutlet UIView *containerView;
@property (weak, nonatomic) IBOutlet UIImageView *demoImageView;

- (IBAction)drawScaleToFillImageButtonTapHandler:(id)sender;
- (IBAction)drawScaleAspectFillImageButtonTapHandler:(id)sender;
- (IBAction)drawScaleAspectFitImageButtonTapHandler:(id)sender;

@end

@implementation OpenGLRenderViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    [self setupView];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    self.openGLImageView = [[ADKOpenGLImageView alloc] initWithFrame:self.containerView.frame];
    self.openGLImageView.backgroundColor = [UIColor lightGrayColor];
    [self.containerView addSubview:self.openGLImageView];
}

- (void)setupView
{
    self.title = @"ADKOpenGLImageView";
    self.edgesForExtendedLayout = UIRectEdgeNone;

    UIImage *demoImage = [UIImage imageNamed:@"Landscape"];
    self.demoImageView.image = demoImage;
}

- (IBAction)drawScaleToFillImageButtonTapHandler:(id)sender
{
    self.openGLImageView.contentMode = ADKOpenGLImageViewContentModeScaleToFill;
    [self renderImage];
}

- (IBAction)drawScaleAspectFillImageButtonTapHandler:(id)sender
{
    self.openGLImageView.contentMode = ADKOpenGLImageViewContentModeScaleAspectFill;
    [self renderImage];
}

- (IBAction)drawScaleAspectFitImageButtonTapHandler:(id)sender
{
    self.openGLImageView.contentMode = ADKOpenGLImageViewContentModeScaleAspectFit;
    [self renderImage];
}

- (void)renderImage
{
    CIImage *inputCoreImage = [CIImage imageWithCGImage:self.demoImageView.image.CGImage];

    CIFilter *instantFilter = [CIFilter filterWithName:@"CIPhotoEffectChrome"];
    [instantFilter setValue:inputCoreImage forKey:kCIInputImageKey];

    self.openGLImageView.image = instantFilter.outputImage;
}

@end
