/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.yahoo.elide.Elide;
import com.yahoo.elide.ElideResponse;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.jsonapi.JsonApiMapper;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.core.graph.GraphNode;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Visitor that walks the data provided by the user to create the graph for validation generation.
 */
public class GenerateEntityGraphVisitor implements Visitor {
    private final Elide elide;
    private final JsonApiMapper jsonMapper;

    public GenerateEntityGraphVisitor(Elide elide, EntityDictionary entityDictionary) {
        this.elide = elide;
        jsonMapper = new JsonApiMapper(entityDictionary);
    }

    @Override
    public void visitEntity(Entity entity) { }

    @Override
    public void visitEntityCollection(EntityCollection entityCollection) {
        ElideResponse response = fetchEntityFromElide(entityCollection);
        Collection<Resource> resources = getResourcesFromElideResponse(response);

        List<GraphNode> lineage = createLineageEndingWithNode(entityCollection);
        SortedMap<String, Entity> entities = getEntitiesFromResources(resources, lineage);
        entityCollection.setAccessibleEntities(entities);
    }

    private ElideResponse fetchEntityFromElide(GraphNode node) {
        ElideResponse response = elide.get(node.generateEntityPath().toString(),
                null,
                null,
                SecurityMode.SECURITY_INACTIVE
        );

        if (response.getResponseCode() != 200) {
            throw new IllegalStateException("Invalid response from Elide: " + response.getBody());
        }

        return response;
    }

    private Collection<Resource> getResourcesFromElideResponse(ElideResponse response) {
        try {
            JsonApiDocument doc = jsonMapper.readJsonApiDocument(response.getBody());
            return doc
                    .getData()
                    .get();
        } catch (IOException e) {
            throw new IllegalStateException("Illegal response from Elide.", e);
        }
    }

    private List<GraphNode> createLineageEndingWithNode(GraphNode node) {
        List<GraphNode> lineage = new ArrayList<>(node.getLineageNodes());
        lineage.add(node);
        return lineage;
    }

    private SortedMap<String, Entity> getEntitiesFromResources(Collection<Resource> resources,
                                                               List<GraphNode> lineage) {
        SortedMap<String, Entity> entities = new TreeMap<>();

        for (Resource resource : resources) {
            String id = resource.getId();
            Entity entity = new Entity(lineage, resource);
            entities.put(id, entity);
        }

        return entities;
    }

    @Override
    public void visitEntityGraph(EntityGraph entityGraph) { }
}
