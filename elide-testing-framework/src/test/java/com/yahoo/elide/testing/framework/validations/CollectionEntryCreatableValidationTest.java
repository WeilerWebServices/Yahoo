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
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URISyntaxException;

/**
 * Test validations for creating entities.
 */
public class CollectionEntryCreatableValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        initalize();

        this.requestMethod = HttpMethod.POST;
        this.successStatusCode = HttpStatusCode.CREATED;

        // user with otherSpouses
        this.entity = TestEntityFactory.getPerson(Names.BONHAM_MARGERY);
        this.uri = entity.generateParentCollectionURI();

        this.validation = new CollectionEntryCreatableValidation(entity, profile, successStatusCode);
    }

    @BeforeMethod
    public void initalize() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MARGERY);
    }

    @Test
    public void testCreateChildren() throws Exception {
        Entity payton = TestEntityFactory.getPerson(Names.BONHAM_PAYTON);
        Validation validation = new CollectionEntryCreatableValidation(payton, profile, successStatusCode);
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testCreatePlaymate() throws Exception {
        Entity payton = TestEntityFactory.getPerson(Names.BONHAM_PAYTON);
        EntityCollection playmates = getCollectionOnEntity(payton, "playmates");
        Entity gavino = getEntityInCollection(playmates, Names.BONHAM_GAVINO);

        // POST /parent/2/children/2/playmates/ id: 1
        Validation validation = new CollectionEntryCreatableValidation(gavino, profile, successStatusCode);
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testCreateEmmnanuelThroughLim() throws Exception {
        super.setup(TestUserFactory.EMMANUEL);

        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        EntityCollection moFriend = getCollectionOnEntity(mo, "friends");

        Entity firstEmmanuel = getEntityInCollection(moFriend, Names.AMALBERTI_EMMANUEL);
        EntityCollection emmanuelFriend = getCollectionOnEntity(firstEmmanuel, "friends");

        Entity goran = getEntityInCollection(emmanuelFriend, Names.TANG_GORAN);
        EntityCollection goranChildren = getCollectionOnEntity(goran, "children");

        Entity lim = getEntityInCollection(goranChildren, Names.TANG_LIM);
        EntityCollection limParent = getCollectionOnEntity(lim, "parents");

        Entity hina = getEntityInCollection(limParent, Names.TANG_HINA);
        EntityCollection hinaFriend = getCollectionOnEntity(hina, "friends");

        Entity secondEmmanuel = getEntityInCollection(hinaFriend, Names.AMALBERTI_EMMANUEL);

        // POST /parent/1/friends/3/friends/4/children/7/parents/5/friends/ id: 3
        Validation validation = new CollectionEntryCreatableValidation(secondEmmanuel, profile, successStatusCode);
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    @Override
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
        StringBuilder builder = new StringBuilder();
        builder.append(baseVisitorToString(validation));
        builder.append("Entity ID: ").append(entity.getId()).append("\t");
        Assert.assertEquals(validation.toString(), builder.toString());
    }
}
