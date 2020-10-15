/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.google.common.collect.Sets;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Tests the entity directory.
 */
public class GenerateEntityDirectoryVisitorTest {
    @Test
    public void testGeneratedEntityDirectory() throws Exception {
        EntityGraph graph = SetupTestDataDriver.getInstance().getEntityGraph();

        GenerateEntityDirectoryVisitor visitor = new GenerateEntityDirectoryVisitor();
        graph.accept(visitor, (UserProfile) null);

        Set<String> expected = Sets.newHashSet("1", "2", "3", "4", "5");
        Set<String> actual =  visitor.getAllIds("parent");

        Assert.assertEquals(expected, actual);

        expected = Sets.newHashSet("1", "2", "3", "4", "5");
        actual = visitor.getAllIds("child");

        Assert.assertEquals(expected, actual);

        expected = Sets.newHashSet("1", "2", "3");
        actual = visitor.getFilteredEntitiesOfType("parent", expected)
                .stream()
                .map(Entity::getId)
                .collect(Collectors.toSet());

        Assert.assertEquals(expected, actual);
    }

    @Test
    public void testOrphanedDatabaseRowsGetAllIds() throws Exception {
        EntityGraph graph = SetupTestDataDriver.getInstance().getEntityGraph();

        GenerateEntityDirectoryVisitor visitor = new GenerateEntityDirectoryVisitor();
        graph.accept(visitor, (UserProfile) null);

        Assert.assertEquals(visitor.getAllIds("NoSuchType").size(), 0);
    }

    @Test
    public void testOrphanedDatabaseRowsGetAllEntitiesOfType() throws Exception {
        EntityGraph graph = SetupTestDataDriver.getInstance().getEntityGraph();

        GenerateEntityDirectoryVisitor visitor = new GenerateEntityDirectoryVisitor();
        graph.accept(visitor, (UserProfile) null);

        Assert.assertEquals(visitor.getAllEntitiesOfType("NoSuchType").size(), 0);
    }

    @Test
    public void testOrphanedDatabaseRowsGetFilteredEntitiesOfType() throws Exception {
        EntityGraph graph = SetupTestDataDriver.getInstance().getEntityGraph();

        GenerateEntityDirectoryVisitor visitor = new GenerateEntityDirectoryVisitor();
        graph.accept(visitor, (UserProfile) null);

        Assert.assertEquals(visitor.getFilteredEntitiesOfType("NoSuchType", Sets.newHashSet("1")).size(), 0);
    }
}
