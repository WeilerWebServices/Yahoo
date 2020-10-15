/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;
import com.yahoo.elide.testing.framework.enums.Permission;
import lombok.Getter;

import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Represents a collection of objects in our object graph.
 */
public class EntityCollection extends GraphNode implements Comparable<EntityCollection> {

    @Getter private boolean exposedRootCollection;
    @Getter private String fieldNameForCollection;
    @Getter private String collectionEntityType = "";
    @Getter private SortedMap<String, Entity> accessibleEntities = new TreeMap<>();

    public EntityCollection(List<GraphNode> lineageNodes, String fieldNameForCollection) {
        this(lineageNodes, fieldNameForCollection, false);
    }

    public EntityCollection(List<GraphNode> lineageNodeList,
                            String fieldNameForCollection,
                            boolean isExposedRootCollection) {
        super(lineageNodeList, fieldNameForCollection);
        this.exposedRootCollection = isExposedRootCollection;
        this.fieldNameForCollection = fieldNameForCollection;
    }

    @Override
    public void accept(Visitor visitor, UserProfile forUser) {
        visitor.visitEntityCollection(this);
        if (forUser == null || canBeAccessedByUserForPermission(forUser, Permission.READ)) {
            accessibleEntities.values().stream()
                              .filter(this::isCycleFree)
                              .forEach(entity -> entity.accept(visitor, forUser));
        }
    }

    public boolean isCycleFree(Entity entity) {
        List<GraphNode> lineageNodeList = entity.getLineageNodes();
        for (GraphNode graphNode : lineageNodeList) {
            if (entity.equals(graphNode)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public boolean canBeAccessedByUserForPermission(UserProfile userProfile, Permission permission) {
        if (exposedRootCollection) {
            return true;
        }
        Entity parent = (Entity) getParentNode();
        return parent.canBeAccessedByUserForPermission(userProfile, permission)
                && userProfile.hasAccessToEntityFieldForPermission(parent, fieldNameForCollection, permission);
    }

    private void setCollectionType() {
        if (accessibleEntities == null || accessibleEntities.size() == 0) {
            return;
        }
        Entity first = accessibleEntities.values().iterator().next();
        this.collectionEntityType = first.getEntityType();
    }

    public void setAccessibleEntities(SortedMap<String, Entity> accessibleEntities) {
        if (accessibleEntities == null) {
            throw new IllegalArgumentException("accessibleEntities cannot be null");
        }
        this.accessibleEntities = accessibleEntities;
        setCollectionType();
    }

    public Set<String> getCollectionIds() {
        return accessibleEntities.keySet();
    }

    public Entity get(String id) {
        if (accessibleEntities.containsKey(id)) {
            return accessibleEntities.get(id);
        }

        throw new IllegalArgumentException(
                "Collection " + fieldNameForCollection + "<" + collectionEntityType + "> does not contain id: " + id
        );
    }

    public Entity getInvalidEntity(String id) {
        List<GraphNode> lineage = getLineageIncludingSelf();
        Resource resource = new Resource(collectionEntityType, id);

        return new Entity(lineage, resource);
    }

    @Override
    public String toString() {
        return "collection[" + fieldNameForCollection + "]";
    }

    @Override
    public int compareTo(EntityCollection other) {
        return fieldNameForCollection.compareTo(other.fieldNameForCollection);
    }
}
