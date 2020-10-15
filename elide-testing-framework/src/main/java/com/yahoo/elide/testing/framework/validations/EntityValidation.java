/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.enums.Permission;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Common code for entity validations.
 */
public abstract class EntityValidation extends Validation {

    /**
     * Classes of fields in an entity.
     */
    protected enum FieldType {
        ONLY_ATTRIBUTES,
        ONLY_RELATIONSHIPS,
        ATTRIBUTES_AND_RELATIONSHIPS
    }

    /**
     * Access levels for fields.
     */
    protected enum FieldAccessLevel {
        READ_ONLY,
        READ_WRITE
    }


    protected Entity entity;

    public EntityValidation(Entity entity,
                            UserProfile profile,
                            HttpMethod requestMethod,
                            HttpStatusCode expectedStatusCode) {
        super(entity, profile, requestMethod, expectedStatusCode);
        this.entity = clone(entity);
    }

    private Entity clone(Entity entity) {
        Resource resource = cloneResource(entity.getResource());
        return new Entity(entity.getLineageNodes(), resource);

    }

    private Resource cloneResource(Resource resource) {
        Resource clone = new Resource(resource.getType(), resource.getId());

        if (resource.getAttributes() != null) {
            clone.setAttributes(new HashMap<>(resource.getAttributes()));
        }
        if (resource.getRelationships() != null) {
            clone.setRelationships(cloneRelationships(resource));
        }

        return clone;
    }

    private Map<String, Relationship> cloneRelationships(Resource resource) {
        Map<String, Relationship> relationships  = new HashMap<>();

        for (Map.Entry<String, Relationship> entry: resource.getRelationships().entrySet()) {
            String key = entry.getKey();
            Relationship relationship = entry.getValue();
            Data<Resource> data = relationship.getData();

            Relationship clone;
            if (data == null) {
                clone = new Relationship(null, null);
            } else if (data.isToOne()) {
                Collection<Resource> single = data.get();
                clone = new Relationship(null, new Data<>((Resource) single.iterator().next()));
            } else {
                clone = new Relationship(null, new Data<>(new HashSet<>(data.get())));
            }

            relationships.put(key, clone);
        }

        return relationships;
    }

    @Override
    public String getId() {
        return super.getId() + entity.getEntityType() + "#" + entity.getId();
    }

    protected JsonApiDocument jsonDocumentWithFields(FieldType fieldTypes, FieldAccessLevel accessLevel) {
        Resource resource = resourceWithFields(fieldTypes, accessLevel);
        return jsonApiDocumentWithResource(resource);
    }

    private JsonApiDocument jsonApiDocumentWithResource(Resource resource) {
        JsonApiDocument toSerialize = new JsonApiDocument();
        toSerialize.setData(new Data<>(resource));
        return toSerialize;
    }

    protected Resource resourceWithFields(FieldType fieldTypes, FieldAccessLevel accessLevel) {
        Resource resource = cloneResource(entity.getResource());
        Map<String, Object> attributes = resource.getAttributes();
        Map<String, Relationship> relationships = resource.getRelationships();

        Set<String> readRestrictedFields = profile.getHiddenFieldsForPermission(entity, Permission.READ);
        Set<String> writeRestrictedFields = profile.getHiddenFieldsForPermission(entity, Permission.UPDATE);

        switch (fieldTypes) {
            case ONLY_ATTRIBUTES:
                relationships.clear();
                break;

            case ONLY_RELATIONSHIPS:
                attributes.clear();
                break;

            case ATTRIBUTES_AND_RELATIONSHIPS:
                break; // do nothing
        }

        filterItemsFromCollection(attributes, readRestrictedFields);
        filterItemsFromCollection(relationships, readRestrictedFields);
        if (accessLevel == FieldAccessLevel.READ_WRITE) {
            filterItemsFromCollection(attributes, writeRestrictedFields);
            filterItemsFromCollection(relationships, writeRestrictedFields);
        }
        filterRelationshipsContentsForExcludedIds(relationships);

        return resource;
    }

    protected JsonApiDocument jsonDocumentWithField(String field) {
        Resource resource = resourceWithField(field);
        return jsonApiDocumentWithResource(resource);
    }

    protected Resource resourceWithField(String field) {
        Resource resource = cloneResource(entity.getResource());
        Map<String, Object> attributes = resource.getAttributes();
        Map<String, Relationship> relationships = resource.getRelationships();
        boolean isAttribute = attributes.containsKey(field);
        boolean isRelationship = relationships.containsKey(field);

        if (isAttribute) {
            Set<String> notThisAttribute = new HashSet<>(attributes.keySet());
            notThisAttribute.stream()
                            .filter(attribute -> !attribute.equals(field))
                            .forEach(attributes::remove);
            relationships.clear();

        } else if (isRelationship) {
            Set<String> notThisRelationship = new HashSet<>(relationships.keySet());
            notThisRelationship.stream()
                               .filter(relationship -> !relationship.equals(field))
                               .forEach(relationships::remove);
            attributes.clear();

        } else {
            throw new IllegalStateException(field + " is not a field on the object");
        }

        return resource;
    }

    private void filterItemsFromCollection(Map<String, ?> collection, Set<String> itemsToFilter) {
        if (collection.size() == 0) {
            return;
        }

        itemsToFilter.stream()
                     .filter(collection::containsKey)
                     .forEach(collection::remove);
    }

    private void filterRelationshipsContentsForExcludedIds(Map<String, Relationship> relationships) {
        for (Relationship relationship : relationships.values()) {
            if (relationship == null) {
                continue;
            }

            Data<Resource> data = relationship.getData();
            if (data == null) {
                continue;
            }

            Collection<Resource> ids = data.get();
            if (ids.isEmpty()) {
                continue;
            }

            Resource resource = ids.iterator().next();
            if (data.isToOne() && resource == null) {
                continue;
            }

            String entityType = resource.getType();
            List<String> permittedIds = profile.getIdListForPermission(entityType, Permission.READ);

            Iterator<Resource> it = ids.iterator();
            while (it.hasNext()) {
                if (!permittedIds.contains(it.next().getId())) {
                    it.remove();
                }
            }
        }
    }
}
