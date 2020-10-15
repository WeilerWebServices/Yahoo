/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors;

import com.yahoo.elide.testing.framework.core.ValidationPlan;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateValidationPlanVisitor;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * Test the validation plan generation.
 */
public class GenerateValidationPlanVisitorTest {

    @BeforeTest
    public void setup() throws Exception {
        SetupTestDataDriver testDataDriver = SetupTestDataDriver.getInstance();

        List<UserProfile> userProfileList = testDataDriver.getDriver().getProfiles();
        EntityGraph entityGraph = testDataDriver.getEntityGraph();

        ValidationPlan plan = new ValidationPlan(testDataDriver.getElide(), new ArrayList<>());
        GenerateValidationPlanVisitor visitor = new GenerateValidationPlanVisitor(plan, userProfileList.get(0));
        entityGraph.accept(visitor, null);
    }

    @Test
    public void testVisitor() throws Exception {
        // Assert we have generated all the types of validations
//        Assert.assertEquals(visitor.getValidationPlan().size(), 161);
    }
}
