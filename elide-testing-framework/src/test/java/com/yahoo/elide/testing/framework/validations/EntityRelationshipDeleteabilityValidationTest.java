/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Tests on validations that delete entity relationships.
 */
public class EntityRelationshipDeleteabilityValidationTest extends BaseValidationTest {

    @BeforeTest
    public void setup() throws URISyntaxException, IOException {
        initialize();

        this.uri = new URI("/parent/1");
        this.requestMethod = HttpMethod.DELETE;
        this.successStatusCode = HttpStatusCode.NO_CONTENT;

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
    private void initialize() throws URISyntaxException, IOException {
        super.setup(TestUserFactory.MO);
    }

    private EntityRelationshipDeleteableValidation getValidation(Entity emmanuel,
                                                                 String relationship,
                                                                 Visibility relationshipVisible,
                                                                 Data<Resource> resources,
                                                                 Visibility resourcesVisible) {
        return new EntityRelationshipDeleteableValidation(
                emmanuel,
                profile,
                relationship,
                relationshipVisible,
                resources,
                resourcesVisible
        );
    }

    @Test
    @Override
    public void testExecute() throws Exception {
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testDeleteFriends() throws Exception {
        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Validation validation = getValidation(
                mo,
                "friends",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("parent", false, "3"),
                Visibility.VISIBLE
        );
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testDeleteChildren() throws Exception {
        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Validation validation = getValidation(
                mo,
                "children",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2", "3"),
                Visibility.VISIBLE
        );
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testFailDeleteChildren() throws Exception {
        super.setup(TestUserFactory.GORAN);
        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Validation validation = getValidation(
                mo,
                "children",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2", "3"),
                Visibility.NOT_VISIBLE
        );
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testDeletePlaymates() throws Exception {
        super.setup(TestUserFactory.GORAN);
        Entity emmanuel = TestEntityFactory.getPerson(Names.AMALBERTI_EMMANUEL);
        EntityCollection emmanuelChildren = getCollectionOnEntity(emmanuel, "children");

        Entity dove = getEntityInCollection(emmanuelChildren, Names.AMALBERTI_DOVE);

        Validation visibleImmutableValidation = getValidation(
                dove,
                "playmates",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2", "3"),
                Visibility.NOT_VISIBLE
        );
        Assert.assertTrue(getValidationResult(visibleImmutableValidation));

        super.setup(TestUserFactory.MO);

        Validation visibleMutableValidation = getValidation(
                dove,
                "playmates",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2", "3"),
                Visibility.VISIBLE
        );
        Assert.assertTrue(getValidationResult(visibleMutableValidation));
    }

    @Test
    public void testFailDeletePlaymates() throws Exception {
        super.setup(TestUserFactory.GORAN);
        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Validation validation = getValidation(
                mo,
                "children",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("child", false, "1", "2", "3"),
                Visibility.NOT_VISIBLE
        );
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    public void testDeleteNullSpouse() throws Exception {
        super.setup(TestUserFactory.EMMANUEL);
        Entity emmanuel = TestEntityFactory.getPerson(Names.AMALBERTI_EMMANUEL);
        Validation validation = getValidation(
                emmanuel,
                "spouse",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("parent", true),
                Visibility.VISIBLE
        );
        Assert.assertTrue(getValidationResult(validation));
    }

    @Test
    void testDeleteEmptyOtherSpouses() throws Exception {
        Entity mo = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Validation validation = getValidation(
                mo,
                "otherSpouses",
                Visibility.VISIBLE,
                getDataOfTypeWithIds("parent", false),
                Visibility.VISIBLE
        );
        Assert.assertFalse(getValidationResult(validation));
    }

    @Test
    @Override
    public void testExecuteForbiddenAccess() throws Exception {

    }

    @Test
    @Override
    public void testExecuteNotFound() throws Exception {

    }

    @Test
    @Override
    public void testToString() throws Exception {

    }
}
