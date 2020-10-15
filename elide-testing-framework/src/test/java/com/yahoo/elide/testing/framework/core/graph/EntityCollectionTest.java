/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.enums.Permission;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Tests the helper methods for our collection objects.
 */
public class EntityCollectionTest {
    private static final String FIELD_NAME = "people";
    private static final String COLLECTION_TYPE = "person";

    private EntityCollection rootCollection;

    @BeforeMethod
    public void setUp() {
        this.rootCollection = new EntityCollection(null, FIELD_NAME, true);
    }

    @Test
    public void testGenerateUrl() {
        Assert.assertEquals(rootCollection.generateEntityPath().toString(), "/people");
    }

    @Test
    public void testGetCollectionName() {
        Assert.assertEquals(rootCollection.getFieldNameForCollection(), FIELD_NAME);
    }

    @Test
    public void testGetCollectionType() {
        Assert.assertEquals(rootCollection.getCollectionEntityType(), "");

        rootCollection.setAccessibleEntities(generateAccessibleEntities());
        Assert.assertEquals(rootCollection.getCollectionEntityType(), COLLECTION_TYPE);
    }

    private SortedMap<String, Entity> generateAccessibleEntities() {
        List<GraphNode> lineage = Arrays.asList(rootCollection);
        Entity first = entityWithLineageAndId(lineage, "1");
        Entity second = entityWithLineageAndId(lineage, "2");

        SortedMap<String, Entity> accessibleEntities = new TreeMap<>();
        accessibleEntities.put("1", first);
        accessibleEntities.put("2", second);
        return accessibleEntities;
    }

    private Entity entityWithLineageAndId(List<GraphNode> lineage, String id) {
        return new Entity(lineage, new Resource(COLLECTION_TYPE, id));
    }

    @Test
    public void testCycleDetection() {
        List<GraphNode> potentiallyCyclicLineage = buildLineageForCycles();

        Entity entityWithoutCycle = entityWithLineageAndId(potentiallyCyclicLineage, "3");
        Entity entityWithCycle = entityWithLineageAndId(potentiallyCyclicLineage, "1");

        Assert.assertTrue(rootCollection.isCycleFree(entityWithoutCycle), "Entity should not have cycles");
        Assert.assertFalse(rootCollection.isCycleFree(entityWithCycle), "Entity should have cycles");
    }

    private List<GraphNode> buildLineageForCycles() {
        SortedMap<String, Entity> people = generateAccessibleEntities();
        rootCollection.setAccessibleEntities(people);

        Entity first = people.get("1");
        List<GraphNode> friendsLineage = new ArrayList<>(first.getLineageNodes());
        friendsLineage.add(first);
        EntityCollection friends = new EntityCollection(friendsLineage, "friends");

        List<GraphNode> potentiallyCyclicLineage = new ArrayList<>(friendsLineage);
        potentiallyCyclicLineage.add(friends);
        return potentiallyCyclicLineage;
    }

    @Test
    public void testRootCollectionAccessibility() {
        Assert.assertTrue(rootCollection.canBeAccessedByUserForPermission(null, Permission.READ));
    }

    @Test
    public void testGetCollectionIds() {
        rootCollection.setAccessibleEntities(generateAccessibleEntities());

        Assert.assertEquals(rootCollection.getCollectionIds(), Arrays.asList("1", "2"));
    }

    @Test
    public void testGetEntity() {
        rootCollection.setAccessibleEntities(generateAccessibleEntities());
        Assert.assertThrows(() -> rootCollection.get("3"));

        Entity e = rootCollection.get("1");
        Assert.assertEquals(e.getId(), "1");
    }

    @Test
    public void testGetInvalidEntity() {
        Entity invalidEntity = rootCollection.getInvalidEntity("9");

        Assert.assertEquals(invalidEntity.getId(), "9");
    }
}
