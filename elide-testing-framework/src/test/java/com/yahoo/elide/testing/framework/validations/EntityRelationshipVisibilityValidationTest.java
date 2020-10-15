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
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Validation for the visibility of entity relationships.
 */
public class EntityRelationshipVisibilityValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        initialize();

        this.uri = new URI("/parent/1");
        this.requestMethod = HttpMethod.GET;
        this.successStatusCode = HttpStatusCode.OK;

        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        this.validation = getValidation(
                mo,
                "spouse",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("parent", true, "2"),
                Visibility.VISIBLE
        );
    }

    @BeforeMethod
    public void initialize() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MO);
    }

    private Validation getValidation(Entity entity,
                                     String relationship,
                                     Visibility relationVisible,
                                     Data<Resource> permitted,
                                     Visibility idsVisible) {
        return new EntityRelationshipVisibilityValidation(
                entity,
                profile,
                relationship,
                relationVisible,
                permitted,
                idsVisible
        );
    }

    @Override
    @Test
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    // Read Relation: User: Parent#4 Request:  GET /parent/4/friends/3/children/5/relationships/playmates
    public void testPartiallyVisibleRelationship() throws Exception {
        super.setup(TestUserFactory.GORAN);
        Entity goran = TestEntityFactory.getPerson(Names.TANG_GORAN);
        EntityCollection goranFriends = getCollectionOnEntity(goran, "friends");

        Entity emmanuel = getEntityInCollection(goranFriends, Names.AMALBERTI_EMMANUEL);
        EntityCollection emmanuelChildren = getCollectionOnEntity(emmanuel, "children");

        Entity dove = getEntityInCollection(emmanuelChildren, Names.AMALBERTI_DOVE);

        Validation visibleValidation = getValidation(
                dove,
                "playmates",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "3"),
                Visibility.VISIBLE
        );
        Assert.assertTrue(getValidationResult(visibleValidation));

        Validation invisibleValidation = getValidation(
                dove,
                "playmates",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2"),
                Visibility.NOT_VISIBLE
        );
        Assert.assertTrue(getValidationResult(invisibleValidation));
    }

    @Override
    @Test
    public void testExecuteNotFound() throws Exception {

    }

    @Override
    @Test
    public void testExecuteForbiddenAccess() throws Exception {

    }

    @Override
    @Test
    public void testToString() throws Exception {

    }
}
