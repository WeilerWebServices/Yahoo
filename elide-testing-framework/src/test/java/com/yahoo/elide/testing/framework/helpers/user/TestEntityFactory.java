/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yahoo.elide.testing.framework.core.graph.GraphNode;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.google.common.collect.Sets;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.jsonapi.JsonApiMapper;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Logic for creating objects with sample data.
 */
public class TestEntityFactory {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final JsonApiMapper JSON_MAPPER = new JsonApiMapper(new EntityDictionary());

    public static Resource loadPersonFile(Names person) {
        Data<Resource> document = loadJsonApiDocument(person.name());
        if (document == null) {
            return null;
        }

        Collection<Resource> resources = document.get();
        if (resources.size() == 1) {
            return resources.iterator().next();
        }

        return null;
    }

    private static Data<Resource> loadJsonApiDocument(String fileName) {
        InputStream fileContents = TestUserFactory.class.getResourceAsStream("/people/" + fileName + ".json");
        try {
            JsonNode json = OBJECT_MAPPER.readTree(fileContents);
            return JSON_MAPPER.readJsonApiDocument(json)
                    .getData();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static EntityCollection getParentsCollectionWith(Names... names) {
        Set<Names> includedParents = Sets.newHashSet(names);

        EntityCollection parentCollection = new EntityCollection(null, "parent");
        List<GraphNode> lineage = Collections.singletonList(parentCollection);

        SortedMap<String, Entity> parents = new TreeMap<>();
        if (includedParents.contains(Names.BONHAM_MO)) {
            Entity mo = generatePersonWithLineage(Names.BONHAM_MO, lineage);
            parents.put(mo.getId(), mo);
        }

        if (includedParents.contains(Names.BONHAM_MARGERY)) {
            Entity margery = generatePersonWithLineage(Names.BONHAM_MARGERY, lineage);
            parents.put(margery.getId(), margery);
        }

        if (includedParents.contains(Names.AMALBERTI_EMMANUEL)) {
            Entity emmanuel = generatePersonWithLineage(Names.AMALBERTI_EMMANUEL, lineage);
            parents.put(emmanuel.getId(), emmanuel);
        }

        parentCollection.setAccessibleEntities(parents);

        return parentCollection;
    }

    public static EntityCollection getChildrenCollectionForParent(Names name) {
        Entity parent;
        switch (name) {
            case BONHAM_MO:
            case BONHAM_MARGERY:
            case AMALBERTI_EMMANUEL:
                parent = getPerson(name);
                break;

            default:
                throw new IllegalStateException(name.toString() + " is not a parent");
        }

        List<GraphNode> lineage = Collections.singletonList(parent);
        return new EntityCollection(lineage, "children");
    }

    public static Entity getPerson(Names name) {
        List<GraphNode> lineage = null;

        switch (name) {
            case BONHAM_MO:
            case BONHAM_MARGERY:
                lineage = Collections.singletonList(getParentsCollectionWith());
                break;

            case BONHAM_GAVINO:
            case BONHAM_PAYTON:
                lineage = Collections.singletonList(getChildrenCollectionForParent(Names.BONHAM_MO));
                break;

            case AMALBERTI_EMMANUEL:
                lineage = Collections.singletonList(getParentsCollectionWith());
                break;

            case AMALBERTI_REBEKA:
            case AMALBERTI_DOVE:
                lineage = Collections.singletonList(getChildrenCollectionForParent(Names.AMALBERTI_EMMANUEL));
                break;

            case TANG_GORAN:
            case TANG_HINA:
                lineage = Collections.singletonList(getParentsCollectionWith());
                break;

            case TANG_LIM:
                lineage = Collections.singletonList(getChildrenCollectionForParent(Names.TANG_GORAN));
                break;
        }

        return generatePersonWithLineage(name, lineage);
    }

    public static Entity generatePersonWithLineage(Names name, List<GraphNode> lineage) {
        Entity person;
        Resource resource = loadPersonFile(name);

        switch (name) {
            case BONHAM_MO:
            case BONHAM_MARGERY:
            case BONHAM_GAVINO:
            case BONHAM_PAYTON:
            case AMALBERTI_EMMANUEL:
            case AMALBERTI_REBEKA:
            case AMALBERTI_DOVE:
            case TANG_GORAN:
            case TANG_HINA:
            case TANG_LIM:
                person = new Entity(lineage, resource);
                break;

            default:
                throw new IllegalStateException("Unknown person");
        }

        return person;
    }
}
