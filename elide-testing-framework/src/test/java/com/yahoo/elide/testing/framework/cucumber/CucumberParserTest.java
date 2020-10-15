/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.cucumber;

import org.testng.annotations.Test;

import java.io.IOException;

/**
 * Test the feature file loader.
 */
public class CucumberParserTest {
    @Test
    public void testCucumberParser() throws IOException {
        String featureFile = "SampleConfig.feature";
        String stepLocation = "com.yahoo.elide/security/testing/framework/cucumber/";
        String absolutePathFeatureFile = CucumberParser.class.getClassLoader().getResource(featureFile).getPath();
        CucumberParser cucumberParser = new CucumberParser(absolutePathFeatureFile, stepLocation);
    }
}
