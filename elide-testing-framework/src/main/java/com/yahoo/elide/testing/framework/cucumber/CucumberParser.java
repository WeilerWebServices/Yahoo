/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.cucumber;

import cucumber.runtime.Runtime;
import cucumber.runtime.ClassFinder;
import cucumber.runtime.RuntimeOptions;
import cucumber.runtime.io.MultiLoader;
import cucumber.runtime.io.ResourceLoader;
import cucumber.runtime.io.ResourceLoaderClassFinder;

import java.io.IOException;
import java.util.Arrays;

/**
 * Glue code to read in data from the feature file.
 */
public class CucumberParser {
    /* Step Definitions is set in StepDefintions class */
    public static StepDefinitions stepDefinitions = (StepDefinitions) null;
    public CucumberParser(String featureFile, String stepDefinitionLocation) throws IOException {

        String[] cucumberOptions = new String[]{
                "--glue",
                stepDefinitionLocation,
                featureFile};
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        RuntimeOptions runtimeOptions = new RuntimeOptions(Arrays.asList(cucumberOptions));
        ResourceLoader resourceLoader = new MultiLoader(classLoader);
        ClassFinder classFinder = new ResourceLoaderClassFinder(resourceLoader, classLoader);

        Runtime runtime = new Runtime(resourceLoader, classFinder, classLoader, runtimeOptions);
        runtime.run();
    }
}
