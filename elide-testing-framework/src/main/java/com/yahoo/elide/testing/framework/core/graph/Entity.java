/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;
import com.yahoo.elide.testing.framework.enums.Permission;
import lombok.Getter;

import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Represents an object in the object graph.
 */
public class Entity extends GraphNode implements Comparable<Entity> {
    @Getter private final String id;
    @Getter private final String entityType;

    @Getter private Resource resource;
    @Getter private Map<String, Object> attributeMap;
    @Getter private SortedMap<String, EntityCollection> relationshipToCollectionMap;
    private Set<String> allFieldNames = null;

    public Entity(List<GraphNode> lineageNodeList, Resource resource) {
        super(lineageNodeList, resource.getId());

        this.id = resource.getId();
        this.entityType = resource.getType();
        this.attributeMap = resource.getAttributes();
        this.relationshipToCollectionMap = getRelationshipsFromResource(resource);
        this.resource = resource;
    }

    private SortedMap<String, EntityCollection> getRelationshipsFromResource(Resource resource) {
        SortedMap<String, EntityCollection> entityCollections = new TreeMap<>();
        List<GraphNode> lineage = getLineageIncludingSelf();

        Map<String, Relationship> relationships = resource.getRelationships();
        if (relationships != null) {
            for (String relationship : relationships.keySet()) {
                EntityCollection entityCollection = new EntityCollection(lineage, relationship);
                entityCollections.put(relationship, entityCollection);
            }
        }


        return entityCollections;
    }

    public Set<Entity> getRelationship(String relationshipName) {
        if (!relationshipToCollectionMap.containsKey(relationshipName)) {
            throw new IllegalStateException("Illegal relationship: " + relationshipName);
        }

        return relationshipToCollectionMap
                .get(relationshipName)
                .getAccessibleEntities()
                .values()
                .stream()
                .collect(Collectors.toSet());
    }

    @Override
    public void accept(Visitor visitor, UserProfile forUser) {
        visitor.visitEntity(this);
        if (forUser == null || canBeAccessedByUserForPermission(forUser, Permission.READ)) {
            visitChildren(visitor, forUser);
        }
    }

    private void visitChildren(Visitor visitor, UserProfile forUser) {
        for (EntityCollection collection : relationshipToCollectionMap.values()) {
            collection.accept(visitor, forUser);
        }
    }

    @Override
    public boolean canBeAccessedByUserForPermission(UserProfile userProfile, Permission permission) {
        GraphNode parent = getParentNode();
        return parent.canBeAccessedByUserForPermission(userProfile, Permission.READ)
                && userProfile.hasAccessToEntityForPermission(this, permission);
    }

    public URI generateParentCollectionURI() {
        URI entityURI = this.generateEntityPath();
        /*
         * This looks incorrect but is actually what we want, the parent collection for /resource/ID is /resource/
         * If we were to resolve '..' we would get just /, which is not the correct uri
         */
        return entityURI.resolve(".");
    }

    public Set<String> getAllFieldNames() {
        if (allFieldNames == null) {
            allFieldNames = new HashSet<>(attributeMap.keySet());
            allFieldNames.addAll(relationshipToCollectionMap.keySet());
        }
        return allFieldNames;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }

        if (!(object instanceof Entity)) {
            return false;
        }

        Entity entity = (Entity) object;
        return entityType.equals(entity.entityType) && id.equals(entity.id);
    }

    @Override
    public int hashCode() {
        int result = id.hashCode();
        result = 31 * result + entityType.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return String.format("[%s#%s]", entityType, id);
    }

    @Override
    public int compareTo(Entity other) {
        if (entityType.equals(other.getEntityType())) {
            return id.compareTo(other.getId());
        }

        return entityType.compareTo(other.getEntityType());
    }
}
