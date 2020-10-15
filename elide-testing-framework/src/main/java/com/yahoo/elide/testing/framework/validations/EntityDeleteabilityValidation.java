/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;

/**
 * This validation ensures that an entity is (or is not) able to be deleted by a user
 * as specified in the configuration file.
 */
public class EntityDeleteabilityValidation extends EntityValidation {

    public EntityDeleteabilityValidation(Entity entity,
                                         UserProfile profile,
                                         HttpStatusCode httpStatusCode) {
        super(entity, profile, HttpMethod.DELETE, httpStatusCode);
    }

    @Override
    public ValidationResult execute(Elide elide) {
        response = elide.delete(getValidationPath(), EMPTY_BODY, opaqueUser, SecurityMode.SECURITY_ACTIVE_VERBOSE);

        boolean success = receivedExpectedStatusCode();
        return buildResult(success);
    }

    @Override
    protected String ruleName() {
        return "Delete";
    }

    @Override
    public String getId() {
        return super.getId() + "@" + getRelevantPath(entity);
    }

    @Override
    public String toString() {
        return super.toString();
    }
}
