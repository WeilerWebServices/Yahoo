/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.enums.Mutability;
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;

/**
 * This validation ensures that an entity's attributes are (or are not) mutable as specified by
 * the configuration file.
 */
public class EntityAttributeMutabilityValidation extends EntityValidation {

    private String attribute;
    private Mutability attributeMutable;

    public EntityAttributeMutabilityValidation(Entity entity,
                                               UserProfile profile,
                                               String attribute,
                                               Mutability attributeMutable) {
        super(
                entity,
                profile,
                HttpMethod.PATCH,
                attributeMutable == Mutability.MUTABLE ? HttpStatusCode.NO_CONTENT : HttpStatusCode.FORBIDDEN
        );
        this.attribute = attribute;
        this.attributeMutable = attributeMutable;
    }

    @Override
    public ValidationResult execute(Elide elide) {
        JsonApiDocument toSerialize = jsonDocumentWithField(attribute);
        response = elide.patch(
                NOT_PATCH_EXTENSION,
                NOT_PATCH_EXTENSION,
                getValidationPath(),
                serializeDocument(toSerialize),
                opaqueUser,
                SecurityMode.SECURITY_ACTIVE_VERBOSE
        );

        boolean success = receivedExpectedStatusCode();

        return buildResult(success);
    }

    @Override
    protected String ruleName() {
        return "SetAttributes";
    }

    @Override
    public String getId() {
        return super.getId() + (attributeMutable == Mutability.MUTABLE ? "Mutable=" : "Immutable=") + attribute;
    }

    @Override
    public String toString() {
        return super.toString()
                + (attributeMutable == Mutability.MUTABLE ? "Mutable: " : "Immutable: ")
                + "'" + attribute + "'" + "\t"
                ;
    }
}
