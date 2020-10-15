/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.Elide;
import com.yahoo.elide.security.SecurityMode;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;
import org.apache.commons.lang3.StringUtils;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * This validation ensures that a collection contains exactly the ids specified in the configuration file.
 */
public class CollectionContentsValidation extends Validation {
    private Set<String> expectedIds = new HashSet<>();
    private EntityCollection collection;

    public CollectionContentsValidation(EntityCollection collection,
                                        UserProfile profile,
                                        HttpStatusCode expectedStatusCode,
                                        Set<String> expectedIds) {
        super(collection, profile, HttpMethod.GET, expectedStatusCode);
        if (expectedIds != null) {
            this.expectedIds = expectedIds;
        }
        this.collection = collection;
    }

    @Override
    public ValidationResult execute(Elide elide) {
        response = elide.get(getValidationPath(), EMPTY_QUERY_PARAMS, opaqueUser, SecurityMode.SECURITY_ACTIVE_VERBOSE);

        boolean success = receivedExpectedStatusCode();
        if (success && expectedStatusCodeHasBody()) {
            success = responseContainsExpectedIds();
        }

        return buildResult(success);
    }

    private boolean responseContainsExpectedIds() {
        Data<Resource> data = getDataFromResponse();

        Set<String> actualIds = new HashSet<>();
        Collection<Resource> resources = data.get();
        for (Resource entity : resources) {
            String id = entity.getId();
            actualIds.add(id);
        }

        return actualIds.equals(expectedIds);
    }

    @Override
    protected String ruleName() {
        return "ReadCollection";
    }

    @Override
    public String getId() {
        int lineageDepth = collection.getLineageNodes().size();
        Entity entity = lineageDepth > 0 ? (Entity) collection.getLineageNodes().get(lineageDepth - 1) : null;

        return ruleName() + ":"
                + (entity != null ? entity.getEntityType() + "/" + entity.getId() : "")
                + "/" + collection.getFieldNameForCollection() + ":"
                + (expectedStatusCodeIsSuccess()
                ?
                    "Visible="
                        + "["
                        + StringUtils.join(expectedIds, ",")
                        + "]"
                    : "Hidden"
                )
                ;
    }

    @Override
    public String toString() {
        return super.toString()
                + "Expected Ids: " + String.format("[%s]", StringUtils.join(expectedIds, ","));
    }
}
