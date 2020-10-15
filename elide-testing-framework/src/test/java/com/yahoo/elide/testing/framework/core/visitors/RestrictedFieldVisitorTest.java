/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors;

import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.testing.framework.core.ValidationDriver;
import com.yahoo.elide.testing.framework.core.visitors.RestrictedFields.RestrictedFieldVisitor;
import com.yahoo.elide.testing.framework.example.beans.Child;
import com.yahoo.elide.testing.framework.example.beans.Parent;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.Set;

/**
 * Test restricted field sets.
 */
public class RestrictedFieldVisitorTest {
    EntityDictionary entityDictionary;

    @BeforeTest
    public void createVisitor() {
        entityDictionary = new EntityDictionary();
        entityDictionary.bindEntity(Parent.class);
        entityDictionary.bindEntity(Child.class);
    }

    @Test
    public void testRestrictedFields() throws Exception {
        RestrictedFieldVisitor visitor = new RestrictedFieldVisitor(entityDictionary, "child");
        Set<String> restrictedFields = visitor.visit(


                ValidationDriver.parseRestrictedFieldExpression("parents, playmates")
        );

        Assert.assertEquals(restrictedFields.size(), 2);
        Assert.assertTrue(restrictedFields.contains("parents"));
        Assert.assertTrue(restrictedFields.contains("playmates"));
    }

    @Test
    public void testAllowedFields() throws Exception {
        RestrictedFieldVisitor visitor = new RestrictedFieldVisitor(entityDictionary, "child");
        Set<String> restrictedFields = visitor.visit(


                ValidationDriver.parseRestrictedFieldExpression("[EXCLUDING]parents, playmates")
        );

        Assert.assertEquals(restrictedFields.size(), 4);
        Assert.assertTrue(restrictedFields.contains("age"));
        Assert.assertTrue(restrictedFields.contains("deceased"));
        Assert.assertTrue(restrictedFields.contains("firstName"));
        Assert.assertTrue(restrictedFields.contains("lastName"));
    }

    @Test
    public void testAllFields() throws Exception {
        RestrictedFieldVisitor visitor = new RestrictedFieldVisitor(entityDictionary, "child");
        Set<String> restrictedFields = visitor.visit(


                ValidationDriver.parseRestrictedFieldExpression("[ALL]")
        );

        Assert.assertEquals(restrictedFields.size(), 6);
        Assert.assertTrue(restrictedFields.contains("age"));
        Assert.assertTrue(restrictedFields.contains("deceased"));
        Assert.assertTrue(restrictedFields.contains("firstName"));
        Assert.assertTrue(restrictedFields.contains("lastName"));
        Assert.assertTrue(restrictedFields.contains("playmates"));
        Assert.assertTrue(restrictedFields.contains("parents"));
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    public void testInvalidRestrictedField() throws Exception {
        RestrictedFieldVisitor visitor = new RestrictedFieldVisitor(entityDictionary, "child");
        visitor.visit(
                ValidationDriver.parseRestrictedFieldExpression("parents, badfield")
        );
    }
}
