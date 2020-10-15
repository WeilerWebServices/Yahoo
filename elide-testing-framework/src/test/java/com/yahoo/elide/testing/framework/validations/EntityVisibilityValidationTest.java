/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Tests on validations for entity visibility.
 */
public class EntityVisibilityValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MO);

        this.uri = new URI("/parent/1");
        this.requestMethod = HttpMethod.GET;
        this.successStatusCode = HttpStatusCode.OK;

        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        this.validation = new EntityVisiblityValidation(mo, profile, successStatusCode);
    }

    @Override
    @Test
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testOtherSpouses() throws Exception {

    }

    @Test(enabled = false)
    @Override
    public void testExecuteNotFound() {

    }

    @Test(enabled = false)
    @Override
    public void testExecuteForbiddenAccess() {

    }


    @Override
    @Test(enabled = false)
    public void testToString() throws Exception {
        Assert.assertEquals(validation.toString(), baseVisitorToString(validation));
    }
}
