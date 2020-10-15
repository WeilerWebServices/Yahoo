/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityDirectory;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Builds the entity dictionary and creates a map of relationship to entity type.
 */
public class GenerateEntityDirectoryVisitor implements Visitor, EntityDirectory {
    Map<String, Map<String, Entity>> entityMap;

    public GenerateEntityDirectoryVisitor() {
        entityMap = new HashMap<>();
    }

    @Override
    public void visitEntity(Entity entity) {
        String type = entity.getEntityType();
        String id = entity.getId();
        if (entityMap.containsKey(type)) {
            entityMap.get(type).put(id, entity);
        } else {
            HashMap<String, Entity> idMap = new HashMap<>();
            idMap.put(id, entity);
            entityMap.put(type, idMap);
        }
    }

    @Override
    public void visitEntityCollection(EntityCollection entityCollection) {
        //DO NOTHING
    }

    @Override
    public void visitEntityGraph(EntityGraph entityGraph) {
        //DO NOTHING

    }

    @Override
    public Set<String> getAllIds(String type) {
        if (!entityMap.containsKey(type)) {
            return new HashSet<>();
        } else {
            return entityMap.get(type)
                .values()
                .stream()
                .map(entity -> entity.getId())
                .collect(Collectors.toSet());
        }
    }

    @Override
    public Set<Entity> getFilteredEntitiesOfType(String type, Set<String> permittedIds) {
        if (!entityMap.containsKey(type)) {
            return new HashSet<>();
        } else {
            return entityMap.get(type)
                    .values()
                    .stream()
                    .filter(entity -> permittedIds.contains(entity.getId()))
                    .collect(Collectors.toSet());
        }
    }

    @Override
    public Set<Entity> getAllEntitiesOfType(String type) {
        if (!entityMap.containsKey(type)) {
            return new HashSet<>();
        } else {
            return entityMap.get(type)
                    .values()
                    .stream()
                    .collect(Collectors.toSet());
        }
    }
}
