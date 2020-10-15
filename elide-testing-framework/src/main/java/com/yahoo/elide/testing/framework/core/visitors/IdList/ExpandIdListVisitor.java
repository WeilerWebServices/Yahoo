/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.IdList;

import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityDirectory;
import com.yahoo.elide.IdListBaseVisitor;
import com.yahoo.elide.IdListParser;
import com.yahoo.elide.core.EntityDictionary;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Parses the configuration and expands the ID lists.
 */
public class ExpandIdListVisitor extends IdListBaseVisitor<Set<String>> {
    private Set<String> ids;
    private EntityDirectory userRestrictedEntityDirectory;
    private EntityDirectory allEntityDirectory;
    private String entityType;
    private EntityDictionary dictionary;

    public ExpandIdListVisitor(EntityDictionary dictionary,
                               String entityType,
                               EntityDirectory userRestrictedEntityDirectory,
                               EntityDirectory allEntityDirectory) {
        this.dictionary = dictionary;
        this.userRestrictedEntityDirectory = userRestrictedEntityDirectory;
        this.allEntityDirectory = allEntityDirectory;
        this.entityType = entityType;
        this.ids = new LinkedHashSet<>();
    }

    @Override
    public Set<String> visitEOF(IdListParser.EOFContext ctx) {
        return ids;
    }

    @Override
    public Set<String> visitIDList(IdListParser.IDListContext ctx) {
        visitChildren(ctx);
        return ids;
    }

    @Override
    public Set<String> visitALL(IdListParser.ALLContext ctx) {
        ids.addAll(allEntityDirectory.getAllIds(entityType));
        return ids;
    }

    @Override
    public Set<String> visitID(IdListParser.IDContext ctx) {
        ids.add(ctx.entityId().getText());
        return ids;
    }

    @Override
    public Set<String> visitListWithID(IdListParser.ListWithIDContext ctx) {
        visitChildren(ctx);
        ids.add(ctx.entityId().getText());
        return ids;
    }

    @Override
    public Set<String> visitSubcollection(IdListParser.SubcollectionContext ctx) {
        String dependentType = ctx.type.getText();
        String relationship = ctx.collection.getText();
        addDependencies(dependentType, relationship);
        return ids;
    }

    @Override
    public Set<String> visitSubcollectionWithList(IdListParser.SubcollectionWithListContext ctx) {
        visitChildren(ctx);
        String dependentType = ctx.type.getText();
        String relationship = ctx.collection.getText();
        addDependencies(dependentType, relationship);
        return ids;
    }

    private void addDependencies(String typeName, String relationship) {
        Class<?> dependentType = dictionary.getEntityClass(typeName);
        if (dependentType == null) {
            throw new IllegalArgumentException("Invalid Entity Type: " + entityType);
        }

        Class<?> relationshipType = dictionary.getParameterizedType(dependentType, relationship);
        String collectionType =  dictionary.getJsonAliasFor(relationshipType);

        if (! entityType.equals(collectionType)) {
            throw new IllegalArgumentException(String.format("Collection type: {} does not match Entity Type: {}",
                    collectionType,
                    entityType));
        }

        Set<Entity> dependentEntities =  userRestrictedEntityDirectory.getAllEntitiesOfType(typeName);

        for (Entity entity : dependentEntities) {
            ids.addAll(
                entity
                    .getRelationship(relationship)
                    .stream()
                    .map(Entity::getId)
                    .collect(Collectors.toSet())
            );
        }
    }
}
