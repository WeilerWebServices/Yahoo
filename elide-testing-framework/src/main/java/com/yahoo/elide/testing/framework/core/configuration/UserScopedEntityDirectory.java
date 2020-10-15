/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import com.google.common.collect.Sets;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.testing.framework.core.ValidationDriver;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityDirectory;
import com.yahoo.elide.testing.framework.core.visitors.IdList.ExpandIdListVisitor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * An entity directory restricted to a particular user profile.  It only
 * provides access to entities the user can access.
 */
@Slf4j
public class UserScopedEntityDirectory implements EntityDirectory {
    private Map<String, EntityMetadata> entityMetadataMap;
    private EntityDirectory allEntityDirectory;
    private EntityDictionary dictionary;

    public UserScopedEntityDirectory(EntityDirectory allEntityDirectory, EntityDictionary dictionary,
                                     List<PermissionsRow> rows) {
        entityMetadataMap = new HashMap<>();
        this.allEntityDirectory = allEntityDirectory;
        this.dictionary = dictionary;

        for (PermissionsRow row : rows) {
            String entityName = row.getEntityName();
            EntityMetadata metadata;
            if (entityMetadataMap.containsKey(entityName)) {
                metadata = entityMetadataMap.get(entityName);
            } else {
                metadata = new EntityMetadata(entityName);
                entityMetadataMap.put(entityName, metadata);
            }
            metadata.addExpression(row.getValidIdsExpression());
        }
    }

    @Override
    public Set<String> getAllIds(String type) {
        return getAllEntitiesOfType(type)
                .stream()
                .map(Entity::getId)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Entity> getFilteredEntitiesOfType(String type, Set<String> permittedIds) {
        Set<Entity> allAllowed = this.getAllEntitiesOfType(type);

        Set<String> allIds = allAllowed
                .stream()
                .map(Entity::getId)
                .collect(Collectors.toSet());

        if (Sets.difference(allIds, permittedIds).size() > 0) {
            throw new IllegalStateException();
        }

        return allAllowed
                .stream()
                .filter(entity -> permittedIds.contains(entity.getId()))
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Entity> getAllEntitiesOfType(String type) {
        if (!entityMetadataMap.containsKey(type)) {
            throw new IllegalStateException("Missing metadata for type: " + type);
        }
        EntityMetadata metadata = entityMetadataMap.get(type);

        /*
         * This method can be called recursively when we expand the IDS for a given
         * expression.  If we are in the process of expanding IDS for a given entity type
         * and this method is called, there is a cycle in the configuration dependency - BAD.
         */
        if (metadata.getVisited() == VisitStatus.VISITING) {
            throw new IllegalStateException("Cycle detected in config: " + metadata);
        }

        if (metadata.getVisited() == VisitStatus.VISITED) {
            return allEntityDirectory.getFilteredEntitiesOfType(type, metadata.getIds());
        }

        metadata.setVisited(VisitStatus.VISITING);
        Set<String> ids = new LinkedHashSet<>();

        for (String expression : metadata.getIdExpressions()) {
            ExpandIdListVisitor visitor = new ExpandIdListVisitor(dictionary, type, this, allEntityDirectory);

            ParseTree tree = ValidationDriver.parseIdListExpression(expression);
            ids.addAll(visitor.visit(tree));
        }

        metadata.setIds(ids);
        metadata.setVisited(VisitStatus.VISITED);

        return allEntityDirectory.getFilteredEntitiesOfType(type, ids);
    }

    private enum VisitStatus {
        UNVISITED,
        VISITING,
        VISITED
    }

    private class EntityMetadata {

        @Getter @Setter
        private VisitStatus visited;

        @Getter
        private String entityName;

        @Getter
        private List<String> idExpressions;

        @Getter @Setter
        private Set<String> ids = new LinkedHashSet<>();

        public EntityMetadata(String entityName) {
            this.entityName = entityName;
            idExpressions = new ArrayList<>();
            ids = new LinkedHashSet<>();
            visited = VisitStatus.UNVISITED;
        }

        public void addExpression(String expression) {
            idExpressions.add(expression);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof EntityMetadata)) {
                return false;
            }

            EntityMetadata that = (EntityMetadata) o;

            if (!entityName.equals(that.entityName)) {
                return false;
            }
            if (visited != that.visited) {
                return false;
            }

            return true;
        }

        @Override
        public int hashCode() {
            return entityName.hashCode();
        }

        @Override
        public String toString() {
            return "EntityMetadata{"
                    + "visited=" + visited
                    + ", entityName='" + entityName + '\''
                    + ", idExpressions='" + idExpressions + '\''
                    + '}';
        }
    }
}
