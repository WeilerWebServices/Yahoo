/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide;

import org.antlr.v4.runtime.misc.ParseCancellationException;
import org.testng.annotations.Test;

import static com.yahoo.elide.testing.framework.core.ValidationDriver.parseIdListExpression;

/**
 * Test the IDListGrammar.
 */
public class IdListGrammarTest {
    @Test
    public void testSingleId() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1"));
    }

    @Test
    public void testListOfIds() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1,2,3"));
    }

    @Test
    public void testAllIds() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("[All]"));
    }

    @Test
    public void testSubcollection() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("[Child.parents]"));
    }

    @Test
    public void testIdsWithSubcollection() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1,2,3,[Child.parents]"));
    }

    @Test
    public void testWhiteSpace() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1 , 2, 3,[  Child.parents  ]"));
    }

    @Test
    public void testIdsWithSubcollections() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1,2,3,[Child.parents],[Child.parents],4,5"));
    }

    @Test(expectedExceptions = ParseCancellationException.class)
    public void testAllWithOtherIdsFails() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("1, [All]"));
    }

    @Test(expectedExceptions = ParseCancellationException.class)
    public void testNestedCollectionFails() throws Exception {
        new IdListBaseVisitor<>().visit(parseIdListExpression("[Child.parents].blah"));
    }
}
