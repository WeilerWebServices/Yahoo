/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateEntityDirectoryVisitor;
import com.yahoo.elide.testing.framework.enums.Permission;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * Test the entity dictionary.
 */
public class UserScopedEntityDirectoryTest {

    GenerateEntityDirectoryVisitor allEntityDirectory;
    EntityDictionary dictionary;
    List<Permission> readPermissions;

    @BeforeTest
    public void setup() throws Exception {
        EntityGraph graph = SetupTestDataDriver.getInstance().getEntityGraph();
        dictionary = SetupTestDataDriver.getInstance().getEntityDictionary();
        allEntityDirectory = new GenerateEntityDirectoryVisitor();
        graph.accept(allEntityDirectory, (UserProfile) null);

        readPermissions = Collections.singletonList(Permission.READ);
    }

    @Test
    public void testSingleListOfIds() throws Exception {
        List<PermissionsRow> rows =  Lists.newArrayList(
               genRow("parent", "1,2,3")

        );
        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                dictionary,
                rows
        );

        Set<String> expected = Sets.newHashSet("1", "2", "3");
        Set<String> actual =  allowedEntityDirectory.getAllIds("parent");

        Assert.assertEquals(expected, actual);
    }

    @Test
    public void testMultipleListOfIds() throws Exception {
        List<PermissionsRow> rows =  Lists.newArrayList(
               genRow("parent", "1,2,3"),
               genRow("parent", "4,5")
        );
        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                dictionary,
                rows
        );

        Set<String> expected = Sets.newHashSet("1", "2", "3", "4", "5");
        Set<String> actual =  allowedEntityDirectory.getAllIds("parent");

        Assert.assertEquals(expected, actual);
    }

    @Test
    public void testAll() throws Exception {
        List<PermissionsRow> rows =  Lists.newArrayList(
               genRow("parent", "[ALL]")
        );
        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                dictionary,
                rows
        );

        Set<String> expected = Sets.newHashSet("1", "2", "3", "4", "5");
        Set<String> actual =  allowedEntityDirectory.getAllIds("parent");

        Assert.assertEquals(expected, actual);
    }

    @Test
    public void testSubCollection() throws Exception {
        List<PermissionsRow> rows =  Lists.newArrayList(
               genRow("child", "[parent.children], 4"),
               genRow("parent", "1")
        );
        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                dictionary,
                rows
        );

        Set<String> expected = Sets.newHashSet("1", "2", "4");
        Set<String> actual =  allowedEntityDirectory.getAllIds("child");

        Assert.assertEquals(expected, actual);
    }

    @Test(expectedExceptions = IllegalStateException.class)
    public void testCyclicSubCollection() throws Exception {
        List<PermissionsRow> rows =  Lists.newArrayList(
               genRow("child", "[parent.children]"),
               genRow("parent", "[child.parents]")
        );
        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                dictionary,
                rows
        );

        allowedEntityDirectory.getAllIds("child");
    }

    private PermissionsRow genRow(String entityType, String validIdsExpression) {
        return new PermissionsRow("Mo", entityType, validIdsExpression, readPermissions, "", "");
    }
}
