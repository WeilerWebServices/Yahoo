/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;

/**
 * Tests on validations that delete entities.
 */
public class EntityDeleteabilityValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MO);

        this.uri = new URI("/parent/1/children/2");
        this.requestMethod = HttpMethod.DELETE;
        this.successStatusCode = HttpStatusCode.NO_CONTENT;
        this.validation = new EntityDeleteabilityValidation(
                TestEntityFactory.getPerson(Names.BONHAM_PAYTON),
                profile,
                HttpStatusCode.NO_CONTENT
        );
    }

    private Entity generateParentWithId(String id) {
        Resource resource = new Resource("parent", id);
        EntityCollection root = new EntityCollection(null, "parent", true);
        return new Entity(Collections.singletonList(root), resource);
    }

    @Test
    @Override
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    @Override
    public void testExecuteForbiddenAccess() throws Exception {
        EntityDeleteabilityValidation deleteEntityValidation = new EntityDeleteabilityValidation(
                TestEntityFactory.getPerson(Names.AMALBERTI_EMMANUEL),
                profile,
                HttpStatusCode.FORBIDDEN
        );

        Assert.assertTrue(getValidationResult(deleteEntityValidation));
    }

    @Test
    @Override
    public void testExecuteNotFound() throws Exception {
        EntityDeleteabilityValidation deleteEntityValidation = new EntityDeleteabilityValidation(
                generateParentWithId("5"),
                profile,
                HttpStatusCode.NOT_FOUND
        );

        Assert.assertTrue(getValidationResult(deleteEntityValidation));
    }

    @Test(enabled = false)
    @Override
    public void testToString() throws Exception {
        Assert.assertEquals(validation.toString(), baseVisitorToString(validation));
    }
}
