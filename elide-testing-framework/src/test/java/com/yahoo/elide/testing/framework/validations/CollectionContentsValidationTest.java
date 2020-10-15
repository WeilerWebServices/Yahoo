/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import org.apache.commons.lang3.StringUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Test validations of collections' contents.
 */
public class CollectionContentsValidationTest extends BaseValidationTest {

    Set<String> idList;

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MARGERY);

        EntityCollection parents = TestEntityFactory.getParentsCollectionWith();
        this.uri = parents.generateEntityPath();
        this.requestMethod = HttpMethod.GET;
        this.successStatusCode = HttpStatusCode.OK;


        idList = new HashSet<>(Arrays.asList("1", "2", "3", "4", "5"));
        this.validation = new CollectionContentsValidation(parents, profile, HttpStatusCode.OK, idList);
    }

    @Test
    public void testOtherSpouses() {
        // Read Collection: User: Parent#2 GET /parent/2/friends/3/otherSpouses
        Set<String> ids = new HashSet<>(Arrays.asList("2"));
        Entity margery = TestEntityFactory.getPerson(Names.BONHAM_MARGERY);
        EntityCollection margeryFriends = getCollectionOnEntity(margery, "friends");

        Entity emmanuel = getEntityInCollection(margeryFriends, Names.AMALBERTI_EMMANUEL);
        EntityCollection emmanuelOtherSpouses = getCollectionOnEntity(emmanuel, "otherSpouses");

        Validation validation = new CollectionContentsValidation(emmanuelOtherSpouses, profile, successStatusCode, ids);
        Assert.assertTrue(getValidationResult(validation));
    }

    @Override
    @Test
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
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
        String builder = baseVisitorToString(validation)
                + "Expected Ids: " + String.format("[%s]", StringUtils.join(idList, ","));

        Assert.assertEquals(validation.toString(), builder);
    }
}
