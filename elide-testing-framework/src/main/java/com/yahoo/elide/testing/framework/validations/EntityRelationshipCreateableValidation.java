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
import com.yahoo.elide.jsonapi.models.Resource;

/**
 * This validation ensures that an entity's relationships are (or are not) able to be created by the user
 * as specified in the configuration file.
 */
public class EntityRelationshipCreateableValidation extends EntityRelationshipValidation {

    public EntityRelationshipCreateableValidation(Entity entity,
                                                  UserProfile profile,
                                                  String relationship,
                                                  Visibility relationshipVisible,
                                                  Data<Resource> resourcesUnderTest,
                                                  Visibility resourcesVisible) {
        super(
                entity,
                profile,
                HttpMethod.POST,
                expectedStatusForTest(relationshipVisible, resourcesVisible),
                relationship,
                resourcesUnderTest
        );
    }

    @Override public ValidationResult execute(Elide elide) {
        JsonApiDocument toCreate = new JsonApiDocument(resourcesUnderTest);
        response = elide.patch(
                NOT_PATCH_EXTENSION,
                NOT_PATCH_EXTENSION,
                getValidationPath(),
                serializeDocument(toCreate),
                opaqueUser,
                SecurityMode.SECURITY_ACTIVE_VERBOSE
        );

        boolean success = receivedExpectedStatusCode();

        return buildResult(success);
    }

    @Override
    protected String ruleName() {
        return "CreateRelation";
    }

    @Override
    public String toString() {
        return super.toString();
    }
}
