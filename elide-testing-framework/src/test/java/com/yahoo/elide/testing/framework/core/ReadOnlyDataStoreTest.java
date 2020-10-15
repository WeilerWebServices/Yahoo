/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core;

import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import com.yahoo.elide.testing.framework.core.elide.override.ReadOnlyDataStore;
import com.yahoo.elide.testing.framework.example.beans.Parent;
import com.yahoo.elide.core.DataStoreTransaction;

import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.HashSet;

/**
 * Test the read-only datastore.
 */
public class ReadOnlyDataStoreTest {
    ReadOnlyDataStore readOnlyDataStore;

    @BeforeTest
    public void setup() throws IOException {
        SetupTestDataDriver driver = SetupTestDataDriver.getInstance();
        readOnlyDataStore = new ReadOnlyDataStore(driver.getDataStore());
    }

    @Test
    public void ensureThatObjectsNotModified() throws Exception {
        DataStoreTransaction tx = readOnlyDataStore.beginTransaction();

        Parent mo1 = tx.loadObject(Parent.class, "1");
        Parent mo2 = tx.loadObject(Parent.class, "1");
        Assert.assertEquals(mo1.getFirstName(), "Mo");

        mo1.setFirstName("Not Mo");
        Assert.assertEquals(mo1.getFirstName(), "Not Mo");

        Assert.assertNotEquals(mo1.getFirstName(), mo2.getFirstName());

        mo1.setFriends(new HashSet<>());
        Assert.assertNotEquals(mo1.getFriends(), mo2.getFriends());

        Parent emmanuel = tx.loadObject(Parent.class, "3");
        Assert.assertTrue(emmanuel.getFriends().contains(mo2));
    }
}
