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
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;

import java.util.Collection;

/**
 * This validation ensures that an entity's relationships are (or are not) visible to a user
 * as specified in the configuration file.
 */
public class EntityRelationshipVisibilityValidation extends EntityRelationshipValidation {

    private Visibility resourcesVisible;

    public EntityRelationshipVisibilityValidation(Entity entity,
                                                  UserProfile profile,
                                                  String relationship,
                                                  Visibility relationshipVisible,
                                                  Data<Resource> resourcesUnderTest,
                                                  Visibility resourcesVisible) {
        super(
                entity,
                profile,
                HttpMethod.GET,
                getExpectedStatusCode(relationshipVisible),
                relationship,
                resourcesUnderTest
        );
        this.resourcesVisible = resourcesVisible;
    }

    protected static HttpStatusCode getExpectedStatusCode(Visibility relationshipVisible) {
        return relationshipVisible == Visibility.VISIBLE
                ? HttpStatusCode.OK
                : HttpStatusCode.NOT_FOUND;
    }

    @Override public ValidationResult execute(Elide elide) {
        response = elide.get(getValidationPath(), EMPTY_QUERY_PARAMS, opaqueUser, SecurityMode.SECURITY_ACTIVE_VERBOSE);

        boolean success = receivedExpectedStatusCode();
        if (success && expectedStatusCodeIsSuccess()) {
            Data<Resource> relationships = getDataFromResponse();
            if (resourcesVisible == Visibility.VISIBLE) {
                success = containsSameResources(relationships, resourcesUnderTest);
            } else {
                success = doesNotContainResources(relationships, resourcesUnderTest);
            }
        }

        return buildResult(success);
    }

    private boolean containsSameResources(Data<Resource> relationships, Data<Resource> permittedResources) {
        validateDataAreSimilar(relationships, permittedResources);
        if (relationships == null && permittedResources == null) {
            return true;
        } else if (relationships == null || permittedResources == null) {
            return false;
        }

        Collection<Resource> received = relationships.get();
        Collection<Resource> permitted = permittedResources.get();

        return received.containsAll(permitted)          // everything received is permitted
                && permitted.containsAll(received);     // everything permitted is received
    }

    private boolean doesNotContainResources(Data<Resource> relationships, Data<Resource> restrictedResources) {
        validateDataAreSimilar(relationships, restrictedResources);
        if (relationships == null && restrictedResources == null) {
            return false;
        } else if (relationships == null || restrictedResources == null) {
            return true;
        }

        Collection<Resource> received = relationships.get();
        Collection<Resource> restricted = restrictedResources.get();

        for (Resource r : received) {
            if (restricted.contains(r)) {
                return false;
            }
        }

        return true;
    }

    private void validateDataAreSimilar(Data<Resource> received, Data<Resource> expecting) {
        // both toOne and both null
        if (received == null && expecting == null) {
            return;
        }

        // both toOne and one is null
        if (received == null && expecting.isToOne()
                || expecting == null && received.isToOne()) {
            return;
        }

        // not a toOne relationship and we got null
        if (received == null || expecting == null) {
            throw new IllegalStateException(
                    String.format("ToMany resources are not supposed to be null. received=null %b, permitted=null %b",
                            received == null,
                            expecting == null
                    )
            );
        }

        // mismatched relationship types
        if (received.isToOne() != expecting.isToOne()) {
            throw new IllegalStateException(
                    String.format("Resources are mismatched: received.isToOne=%b permitted.isToOne=%b",
                            received.isToOne(),
                            expecting.isToOne()
                    )
            );
        }
    }

    @Override
    protected String ruleName() {
        return "ReadRelation";
    }

    @Override
    public String toString() {
        return super.toString();
    }
}
