/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.Resource;

/**
 * This validation ensures that an entity's attributes are (or are not) visible by a user
 * as specified in the configuration file.
 */
public class EntityAttributeVisibilityValidation extends EntityValidation {

    private String attribute;
    private Visibility attributeVisibility;

    public EntityAttributeVisibilityValidation(Entity entity,
                                               UserProfile profile,
                                               String attribute,
                                               Visibility attributeVisibility) {
        super(entity, profile, HttpMethod.GET, HttpStatusCode.OK);
        this.attribute = attribute;
        this.attributeVisibility = attributeVisibility;
    }

    @Override
    public ValidationResult execute(Elide elide) {
        response = elide.get(getValidationPath(), EMPTY_QUERY_PARAMS, opaqueUser, SecurityMode.SECURITY_ACTIVE_VERBOSE);

        boolean success = receivedExpectedStatusCode();
        if (success) {
            success = attributePresentInResponse(attributeVisibility == Visibility.VISIBLE);
        }

        return buildResult(success);
    }

    private boolean attributePresentInResponse(boolean isPresent) {
        Resource resource = getDataFromResponse().get().iterator().next();

        return isPresent == resource.getAttributes().containsKey(attribute);
    }

    @Override
    protected String ruleName() {
        return "ReadAttributes";
    }

    @Override
    public String getId() {
        return super.getId() + (attributeVisibility == Visibility.VISIBLE ? "Visible=" : "Hidden=") + attribute;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(super.toString());
        builder.append(attributeVisibility == Visibility.VISIBLE ? "Visible: " : "Hidden: ")
               .append("'")
               .append(attribute)
               .append("'")
               .append("\t");
        return builder.toString();
    }
}
