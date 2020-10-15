/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.RestrictedFields;

import com.google.common.collect.Sets;
import com.yahoo.elide.RestrictedFieldsBaseVisitor;
import com.yahoo.elide.RestrictedFieldsParser;
import com.yahoo.elide.core.EntityDictionary;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Generate the set of restricted fields.
 */
public class RestrictedFieldVisitor extends RestrictedFieldsBaseVisitor<Set<String>> {
    private Set<String> restrictedFields;
    private String entityType;
    private EntityDictionary entityDictionary;
    private Class entityClass;

    public RestrictedFieldVisitor(EntityDictionary entityDictionary, String entityType) {
        this.entityType = entityType;
        this.entityClass = entityDictionary.getEntityClass(entityType);
        if (entityClass == null) {
            throw new IllegalArgumentException("No such type: " + entityType);
        }
        this.entityDictionary = entityDictionary;
        this.restrictedFields = new LinkedHashSet<>();
    }

    @Override
    public Set<String> visitALL(RestrictedFieldsParser.ALLContext ctx) {
        Set<String> allFields = new LinkedHashSet<>();

        allFields.addAll(entityDictionary.getAttributes(entityClass));
        allFields.addAll(entityDictionary.getRelationships(entityClass));

        restrictedFields = allFields;
        return restrictedFields;
    }

    @Override
    public Set<String> visitStart(RestrictedFieldsParser.StartContext ctx) {
        visitChildren(ctx);
        return restrictedFields;
    }

    @Override
    public Set<String> visitTERM(RestrictedFieldsParser.TERMContext ctx) {
        String field = ctx.TERM().getText();
        if (entityDictionary.getAccessibleObject(entityClass, field) == null) {
            throw new IllegalArgumentException("No such field: " + field);
        }
        restrictedFields.add(field);
        return visitChildren(ctx);
    }

    /* CHECKSTYLE:OFF MethodName */
    @Override
    public Set<String> visitTERM_LIST(RestrictedFieldsParser.TERM_LISTContext ctx) {
        String field = ctx.TERM().getText();
        if (entityDictionary.getAccessibleObject(entityClass, field) == null) {
            throw new IllegalArgumentException("No such field: " + field);
        }
        restrictedFields.add(field);
        return visitChildren(ctx);
    }
    @Override
    public Set<String> visitExcluding_fields(RestrictedFieldsParser.Excluding_fieldsContext ctx) {
        visitChildren(ctx);
        Set<String> allFields = new LinkedHashSet<>();

        allFields.addAll(entityDictionary.getAttributes(entityClass));
        allFields.addAll(entityDictionary.getRelationships(entityClass));

        restrictedFields = Sets.difference(allFields, restrictedFields);
        return restrictedFields;
    }
    /* CHECKSTYLE:ON MethodName */
}
