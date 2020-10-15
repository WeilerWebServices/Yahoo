/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Tests on the helper methods of entities.
 */
public class EntityTest {
    private static Entity ENTITY = TestEntityFactory.generatePersonWithLineage(Names.BONHAM_MO, null);
    private static String ID = ENTITY.getId();
    private static String ENTITY_TYPE = ENTITY.getEntityType();

    @BeforeMethod
    public void setup() {
        ENTITY = TestEntityFactory.generatePersonWithLineage(Names.BONHAM_MO, null);
    }

    @Test
    public void testGetId() throws Exception {
        Assert.assertEquals(ENTITY.getId(), ID);
    }

    @Test
    public void testGetEntityType() throws Exception {
        Assert.assertEquals(ENTITY.getEntityType(), ENTITY_TYPE);
    }

    @Test
    public void testGenerateUrl() throws Exception {
        Assert.assertEquals(ENTITY.generateEntityPath().toString(), "/1");

        Entity moBonham = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Assert.assertEquals(moBonham.generateEntityPath().toString(), "/parent/1");
    }

    @Test
    public void testEquals() {
        Assert.assertTrue(ENTITY.equals(ENTITY));

        Entity identicalEntity = generateIdenticalEntity();
        Assert.assertTrue(ENTITY.equals(identicalEntity));
        Assert.assertTrue(identicalEntity.equals(ENTITY));

        Entity differentId = generateEntityWithDifferentId();
        Assert.assertFalse(ENTITY.equals(differentId));
        Assert.assertFalse(differentId.equals(ENTITY));

        Entity differentType = generateEntityWithDifferentType();
        Assert.assertFalse(ENTITY.equals(differentType));
        Assert.assertFalse(differentType.equals(ENTITY));

        Entity differentEntity = generateDifferentEntity();
        Assert.assertFalse(ENTITY.equals(differentEntity));
        Assert.assertFalse(differentEntity.equals(ENTITY));
    }

    private Entity generateIdenticalEntity() {
        return new Entity(null, new Resource(ENTITY_TYPE, ID));
    }

    private Entity generateEntityWithDifferentId() {
        return new Entity(null, new Resource(ENTITY_TYPE, "2"));
    }

    private Entity generateEntityWithDifferentType() {
        return new Entity(null, new Resource("Foo", ID));
    }

    private Entity generateDifferentEntity() {
        return new Entity(null, new Resource("Foo", "2"));
    }

    @Test
    public void testHashCode() {
        Entity identicalEntity = generateIdenticalEntity();
        Assert.assertEquals(ENTITY.hashCode(), identicalEntity.hashCode());

        Entity differentId = generateEntityWithDifferentId();
        Assert.assertNotEquals(ENTITY.hashCode(), differentId.hashCode());

        Entity differentType = generateEntityWithDifferentType();
        Assert.assertNotEquals(ENTITY.hashCode(), differentType.hashCode());

        Entity differentEntity = generateDifferentEntity();
        Assert.assertNotEquals(ENTITY.hashCode(), differentEntity.hashCode());
    }

    @Test
    public void testParentCollectionURI() {
        Entity entityWithLineage = TestEntityFactory.getPerson(Names.BONHAM_MO);
        Assert.assertEquals(entityWithLineage.generateParentCollectionURI().toString(), "/parent/");
    }
}
