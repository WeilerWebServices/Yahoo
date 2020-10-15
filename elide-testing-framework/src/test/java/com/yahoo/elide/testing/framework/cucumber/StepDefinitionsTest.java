/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.cucumber;

import com.google.common.collect.Lists;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Test the step definitions.
 */
public class StepDefinitionsTest {

    @Test
    public void testExpandAliases() throws Exception {
        List<String> row1 = Lists.newArrayList("baz", "1", "2", "3");
        List<String> row2 = Lists.newArrayList("4", "5");
        List<String> row3 = Lists.newArrayList("6", "7");
        Map<String, List<String>> aliasMap = new HashMap<>();
        aliasMap.put("foobar", row1);
        aliasMap.put("baz", row2);
        aliasMap.put("blah", row3);

        expandAliases("foobar", aliasMap);
    }

    @Test(expectedExceptions = InvocationTargetException.class)
    public void testExpandAliasCycleDetection() throws Exception {
        List<String> row1 = Lists.newArrayList("baz", "1", "2", "3");
        List<String> row2 = Lists.newArrayList("bar", "5");
        Map<String, List<String>> aliasMap = new HashMap<>();
        aliasMap.put("bar", row1);
        aliasMap.put("baz", row2);
        expandAliases("baz", aliasMap);
    }

    @Test
    void testVariableSubstitute() throws Exception {
        String expansion1 = "1,2,3";
        String expansion2 = "5,6,7";


        Map<String, String> aliasMap = new HashMap<>();
        aliasMap.put("foobar", expansion1);
        aliasMap.put("baz", expansion2);

        String expanded = variableSubstitute("foobar,4, baz, 8", aliasMap);
        Assert.assertEquals(expanded, "1,2,3,4, 5,6,7, 8");
    }

    private Set<String> expandAliases(String expression, Map<String, List<String>> aliases) throws Exception {
        Method method = StepDefinitions.class.getDeclaredMethod("expandAliases", String.class, Map.class);
        method.setAccessible(true);

        return (Set<String>) method.invoke(null, expression, aliases);
    }

    private String variableSubstitute(String expression, Map<String, String> aliases) throws Exception {
        Method method = StepDefinitions.class.getDeclaredMethod("variableSubstitute", String.class, Map.class);
        method.setAccessible(true);

        return (String) method.invoke(null, expression, aliases);
    }
}
