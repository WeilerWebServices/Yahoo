/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;
import org.apache.commons.lang3.StringUtils;

import javax.ws.rs.core.UriBuilder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Common code for validating entity relationships.
 */
public abstract class EntityRelationshipValidation extends EntityValidation {

    protected String relationship;
    protected Data<Resource> resourcesUnderTest;

    public EntityRelationshipValidation(Entity entity,
                                        UserProfile profile,
                                        HttpMethod requestMethod,
                                        HttpStatusCode expectedStatusCode,
                                        String relationship,
                                        Data<Resource> resourcesUnderTest) {
        super(entity, profile, requestMethod, expectedStatusCode);
        this.relationship = relationship;
        this.resourcesUnderTest = resourcesUnderTest;
    }

    @Override
    protected String getValidationPath() {
        return UriBuilder.fromUri(entity.generateEntityPath())
                .path("relationships")
                .path(relationship)
                .build()
                .toString();
    }

    @Override
    public String getId() {
        Collection<Resource> data = resourcesUnderTest == null ? null : resourcesUnderTest.get();
        List<String> ids = data == null
                ? new ArrayList<>()
                : data.stream()
                      .map(Resource::getId)
                      .collect(Collectors.toList())
                ;

        return super.getId() + "/relationships/" + relationship + ":"
                + (expectedStatusCodeIsSuccess() ? "Permitted=" : "Denied=")
                + "["
                + StringUtils.join(ids, ",")
                + "]"
                ;
    }

    protected JsonApiDocument jsonDocumentWithResourcesFromField(String field) {
        Resource resourceWithField = resourceWithField(field);
        Relationship relationship = resourceWithField.getRelationships().get(field);

        JsonApiDocument doc = new JsonApiDocument();
        doc.setData(relationship.getData());

        return doc;
    }

    protected static HttpStatusCode expectedStatusForTest(Visibility relationship, Visibility resources) {
        if (relationship == Visibility.VISIBLE) {
            return resources == Visibility.VISIBLE ? HttpStatusCode.NO_CONTENT : HttpStatusCode.FORBIDDEN;
        } else {
            return HttpStatusCode.FORBIDDEN;
        }
    }

    @Override
    public String toString() {
        return super.toString()
                + (expectedStatusCodeIsSuccess() ? "Permitted:" : "Denied:")
                + "'" + relationship + "'" + "\t"
                + "resource:" + resourcesUnderTest + "\t"
                ;
    }
}
