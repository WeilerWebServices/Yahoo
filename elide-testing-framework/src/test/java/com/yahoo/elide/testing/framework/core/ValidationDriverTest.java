/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import com.yahoo.elide.testing.framework.validations.ValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Map;

/**
 * Test the validation driver (run the example feature file).
 */
@Slf4j
public class ValidationDriverTest {
    private ValidationDriver validationDriver;

    @BeforeTest
    public void setup() throws Exception {
        SetupTestDataDriver testDataDriver = SetupTestDataDriver.getInstance();
        validationDriver = testDataDriver.getDriver();
    }

    @Test
    public void testValidationDriver() throws Exception {
        Assert.assertNotNull(validationDriver.getUserValidationPlans());
        // Each user has a list of failed results
        Assert.assertEquals(validationDriver.getUserValidationPlans().size(), 5);
    }

    @Test
    public void testExecute() throws Exception {
        Map<UserProfile, List<ValidationResult>> failedValidationsMap = validationDriver.execute();

        int failureCount = 0;
        StringBuilder builder = new StringBuilder();
        for (List<ValidationResult> failures : failedValidationsMap.values()) {
            failureCount += failures.size();
            failures.forEach(failure -> builder.append(failure).append("\n"));
        }
        log.info("Failures:\n{}", builder.length() == 0 ? "None" : builder);

        for (Map.Entry<UserProfile, List<ValidationResult>> failures : failedValidationsMap.entrySet()) {
            log.info("{} {}", failures.getKey(), failures.getValue().size());
        }
        Assert.assertEquals(failureCount, 0);
    }
}
