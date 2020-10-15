/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

/**
 * Test stuff about the entity graph.
 */
public class EntityGraphTest {

    EntityGraph entityGraph;

    @BeforeTest
    public void setup() {
        this.entityGraph = new EntityGraph(null);
    }

    @Test
    public void testAccept() throws Exception {
        //TODO: Implement after implementing the method
    }

    @Test
    public void testGetRootCollectionsList() throws Exception {
        Assert.assertEquals(entityGraph.getRootCollectionsList(), null);
    }
}
