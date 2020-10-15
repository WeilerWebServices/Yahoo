/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.elide;

import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Tests on upstream object JsonApiDocument.
 */
public class JsonApiDocumentTest {

    private Resource resource1;
    private Resource resource2;

    @BeforeMethod
    private void setup() {
        resource1 = new Resource("type", "1");
        resource2 = new Resource("type", "1");
    }

    @Test
    public void testEqualsEmpty() {
        JsonApiDocument document1 = new JsonApiDocument(new Data<>(resource1));
        JsonApiDocument document2 = new JsonApiDocument(new Data<>(resource2));

        Assert.assertTrue(document1.equals(document2));
        Assert.assertTrue(document2.equals(document1));
    }

    @Test
    public void testEqualsAttributes() {
        resource1.setAttributes(getAttributes1());
        resource2.setAttributes(getAttributes2());

        JsonApiDocument document1 = new JsonApiDocument(new Data<>(resource1));
        JsonApiDocument document2 = new JsonApiDocument(new Data<>(resource2));

        Assert.assertTrue(document1.equals(document2));
        Assert.assertTrue(document2.equals(document1));
    }

    protected Map<String, Object> getAttributes1() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("foo", "foo");
        attributes.put("bar", "bar");
        attributes.put("baz", "baz");
        return attributes;
    }

    protected Map<String, Object> getAttributes2() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("baz", "baz");
        attributes.put("bar", "bar");
        attributes.put("foo", "foo");
        return attributes;
    }

    @Test
    public void testEqualsRelationships() {
        resource1.setRelationships(getRelationshipsWithIds("1", "2", "3"));
        resource2.setRelationships(getRelationshipsWithIds("3", "1", "2"));

        JsonApiDocument document1 = new JsonApiDocument(new Data<>(resource1));
        JsonApiDocument document2 = new JsonApiDocument(new Data<>(resource2));

        Assert.assertTrue(document1.equals(document2));
        Assert.assertTrue(document2.equals(document1));
    }

    private Map<String, Relationship> getRelationshipsWithIds(String... ids) {
        Map<String, Relationship> relationships = new HashMap<>();
        relationships.put("toManyFull", new Relationship(null, dataWithIds(ids)));
        relationships.put("toManyEmpty", new Relationship(null, dataWithIds()));
        relationships.put("toOneFull", new Relationship(null, new Data<>(new Resource("type", "1"))));
        relationships.put("toOneEmpty", new Relationship(null, new Data<>((Resource) null)));
        return relationships;
    }

    private Data<Resource> dataWithIds(String... ids) {
        ArrayList<Resource> resources = new ArrayList<>();

        for (String id : ids) {
            resources.add(new Resource("type", id));
        }

        return new Data<>(resources);
    }

    @Test
    public void testEqualsFull() {
        resource1.setAttributes(getAttributes1());
        resource1.setRelationships(getRelationshipsWithIds("1", "2", "3"));
        resource2.setAttributes(getAttributes2());
        resource2.setRelationships(getRelationshipsWithIds("2", "1", "3"));


        JsonApiDocument document1 = new JsonApiDocument(new Data<>(resource1));
        JsonApiDocument document2 = new JsonApiDocument(new Data<>(resource2));

        Assert.assertTrue(document1.equals(document2));
        Assert.assertTrue(document2.equals(document1));
    }
}
