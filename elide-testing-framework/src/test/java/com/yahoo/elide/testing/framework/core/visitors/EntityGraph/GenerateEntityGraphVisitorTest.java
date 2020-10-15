/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.Map;

/**
 * Tests the entity graph generation.
 */
public class GenerateEntityGraphVisitorTest {

    private EntityCollection entityCollection;

    @BeforeClass
    public void setup() throws Exception {
        SetupTestDataDriver testDataDriver = SetupTestDataDriver.getInstance();

        EntityGraph entityGraph = testDataDriver.getEntityGraph();
        entityCollection = entityGraph.getRootCollectionsList().iterator().next();
    }

    @Test
    public void testVisitEntityGraph() throws Exception {

    }

    @Test
    public void testVisitEntityCollection() throws Exception {
        Map<String, Entity> entities = entityCollection.getAccessibleEntities();

        Assert.assertNotNull(entities);
        Assert.assertEquals(entities.size(), 5);
        Assert.assertNotNull(entityCollection.getLineageNodes());
        Assert.assertEquals(entityCollection.getLineageNodes().size(), 0);

    }

    @Test
    public void testVisitEntity() throws Exception {
        Map<String, Entity> entities = entityCollection.getAccessibleEntities();
        for (Map.Entry<String, Entity> entry : entities.entrySet()) {
            String id = entry.getKey();
            Entity entity = entry.getValue();

            Assert.assertEquals(entity.getId(), id);

            Map<String, EntityCollection> collections = entity.getRelationshipToCollectionMap();
            Assert.assertNotNull(collections);
            Assert.assertEquals(collections.size(), 4);

            Assert.assertNotNull(entity.getLineageNodes());
            Assert.assertEquals(entity.getLineageNodes().size(), 1);
            Assert.assertEquals(entity.getLineageNodes().get(0), entityCollection);
        }
    }
}
