/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide;

import org.antlr.v4.runtime.misc.ParseCancellationException;
import org.testng.annotations.Test;

import static com.yahoo.elide.testing.framework.core.ValidationDriver.parseRestrictedFieldExpression;

/**
 * Test the restricted field grammar.
 */
public class RestrictedFieldGrammarTest {
    @Test
    public void testSingleField() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression("foo"));
    }

    @Test
    public void testListOfFields() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression("foo,bar,baz"));
    }

    @Test
    public void testExcludingListOfFields() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression("[Excluding]foo,bar,baz"));
    }

    @Test
    public void testIgnoreWhiteSpace() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression(" [Excluding] foo, bar,baz  "));
    }

    @Test(expectedExceptions = ParseCancellationException.class)
    public void testParseError() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression(" [Excluding] foo, 123,baz  "));
    }

    @Test
    public void testAll() throws Exception {
        new RestrictedFieldsBaseVisitor().visit(parseRestrictedFieldExpression("[ALL]"));
    }
}
