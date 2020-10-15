/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;

import static com.yahoo.elide.testing.framework.enums.Mutability.MUTABLE;
import static com.yahoo.elide.testing.framework.enums.Mutability.NOT_MUTABLE;
import static com.yahoo.elide.testing.framework.helpers.user.Names.BONHAM_MO;
import static com.yahoo.elide.testing.framework.helpers.user.TestUserFactory.MO;

/**
 * Test validations on attribute mutability.
 */
public class EntityAttributeMutabilityValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws IOException {
        super.setup(MO);

        this.requestMethod = HttpMethod.PATCH;
        this.successStatusCode = HttpStatusCode.NO_CONTENT;

        this.entity = TestEntityFactory.getPerson(BONHAM_MO);
        this.uri = entity.generateEntityPath();

        this.validation = new EntityAttributeMutabilityValidation(entity, profile, "firstName", MUTABLE);

    }

    @Override
    @Test
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
    }

    @Override
    @Test(enabled = false)
    public void testExecuteNotFound() throws Exception {
        // test for an entity that user cannot read
    }

    @Override
    @Test
    public void testExecuteForbiddenAccess() throws Exception {
        Validation validation = new EntityAttributeMutabilityValidation(entity, profile, "deceased", NOT_MUTABLE);
        Assert.assertTrue(getValidationResult(validation));
    }

    @Override
    public void testToString() throws Exception {

    }
}
