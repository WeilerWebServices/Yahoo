/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;

/**
 * This validation ensures that an entity's relationships are (or are not) able to be deleted by a user
 * as specified in the configuration file.
 */
public class EntityRelationshipDeleteableValidation extends EntityRelationshipValidation {

    public EntityRelationshipDeleteableValidation(Entity entity,
                                                  UserProfile profile,
                                                  String relationship,
                                                  Visibility relationshipVisible,
                                                  Data<Resource> resourcesUnderTest,
                                                  Visibility resourcesVisible) {
        super(
                entity,
                profile,
                HttpMethod.DELETE,
                expectedStatusForTest(relationshipVisible, resourcesVisible),
                relationship,
                resourcesUnderTest
        );
    }

    @Override
    public ValidationResult execute(Elide elide) {
        JsonApiDocument toDelete = new JsonApiDocument(resourcesUnderTest);
        if (isToOne(relationship)) {
            response = elide.patch(
                    NOT_PATCH_EXTENSION,
                    NOT_PATCH_EXTENSION,
                    getValidationPath(),
                    serializeDocument(toDelete),
                    opaqueUser,
                    SecurityMode.SECURITY_ACTIVE_VERBOSE
            );
        } else {
            response = elide.delete(
                    getValidationPath(),
                    serializeDocument(toDelete),
                    opaqueUser,
                    SecurityMode.SECURITY_ACTIVE_VERBOSE
            );
        }

        boolean success = receivedExpectedStatusCode();

        return buildResult(success);

    }

    private boolean isToOne(String fieldName) {
        Relationship relationship = entity.getResource().getRelationships().get(fieldName);
        Data<Resource> data = relationship.getData();
        return data == null || data.isToOne();
    }

    @Override
    protected String ruleName() {
        return "DeleteRelation";
    }

    @Override
    public String toString() {
        return super.toString();
    }
}
