/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;

import static com.yahoo.elide.testing.framework.validations.EntityValidation.FieldAccessLevel.*;
import static com.yahoo.elide.testing.framework.validations.EntityValidation.FieldType.*;

/**
 * This validation ensures that entities in a collection can be (or cannot be) created by a user
 * as specified in the configuration file.
 */
public class CollectionEntryCreatableValidation extends EntityValidation {

    private JsonApiDocument shouldReceive = null;

    public CollectionEntryCreatableValidation(Entity entity, UserProfile profile, HttpStatusCode httpStatusCode) {
        super(entity, profile, HttpMethod.POST, httpStatusCode);
    }

    @Override
    protected String getValidationPath() {
        return entity.generateParentCollectionURI().toString();
    }

    @Override
    public ValidationResult execute(Elide elide) {
        JsonApiDocument toSerialize = jsonDocumentWithFields(ATTRIBUTES_AND_RELATIONSHIPS, READ_WRITE);
        response = elide.post(
                getValidationPath(),
                serializeDocument(toSerialize),
                opaqueUser,
                SecurityMode.SECURITY_ACTIVE_VERBOSE
        );

        boolean success = receivedExpectedStatusCode();
        if (success && expectedStatusCode == HttpStatusCode.CREATED) {
            shouldReceive = jsonDocumentWithFields(ATTRIBUTES_AND_RELATIONSHIPS, READ_ONLY);
            success = shouldReceive.equals(responseDocument());
        }

        return buildResult(success);
    }

    @Override
    protected String ruleName() {
        return "Create";
    }

    @Override
    public String getId() {
        return super.getId() + "@" + getRelevantPath(entity);
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(super.toString());
        builder.append("Entity ID: ")
               .append(entity.getId())
               .append("\t");

        builder.append("Should receive: ");
        try {
            builder.append(JSON_MAPPER.writeJsonApiDocument(shouldReceive));
        } catch (JsonProcessingException e) {
            builder.append(shouldReceive);
        }
        builder.append("\t");

        return builder.toString();
    }
}
