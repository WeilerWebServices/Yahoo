/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yahoo.elide.Elide;
import com.yahoo.elide.ElideResponse;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.jsonapi.JsonApiMapper;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.JsonApiDocument;
import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.GraphNode;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;

import javax.ws.rs.core.MultivaluedMap;
import java.io.IOException;
import java.util.List;

/**
 * Base logic for validations.
 */
public abstract class Validation {
    public static final String NOT_PATCH_EXTENSION = null;
    public static final String EMPTY_BODY = null;
    public static final MultivaluedMap<String, String> EMPTY_QUERY_PARAMS = null;

    protected static final JsonApiMapper JSON_MAPPER = new JsonApiMapper(new EntityDictionary());

    protected GraphNode graphNode;
    protected HttpMethod requestMethod;
    protected HttpStatusCode expectedStatusCode;

    protected UserProfile profile;
    protected Object opaqueUser;
    protected ElideResponse response;

    public Validation(GraphNode graphNode,
                      UserProfile profile,
                      HttpMethod requestMethod,
                      HttpStatusCode expectedStatusCode) {
        this.graphNode = graphNode;
        this.profile = profile;
        this.opaqueUser = profile.getUser().getOpaqueUser();
        this.requestMethod = requestMethod;
        this.expectedStatusCode = expectedStatusCode;
    }

    /*
     * Methods to override
     */
    public abstract ValidationResult execute(Elide elide);
    protected String getValidationPath() {
        return graphNode.generateEntityPath().toString();
    }
    public String getId() {
        return ruleName() + ":";
    }
    protected String ruleName() {
        return "Validation";
    }
    /*
     * Utilities
     */
    protected String serializeDocument(JsonApiDocument toSerialize) {
        try {
            return JSON_MAPPER.writeJsonApiDocument(toSerialize);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    protected ValidationResult buildResult(boolean success) {
        return new ValidationResult(this, response, success);
    }

    protected boolean receivedExpectedStatusCode() {
        int status = response.getResponseCode();
        return status == expectedStatusCode.getStatusCode() || isBadStatusCodeFromElide(status);
    }

    protected boolean isBadStatusCodeFromElide(int status) {
        return  (
                status == HttpStatusCode.FORBIDDEN.getStatusCode()
                        && expectedStatusCode == HttpStatusCode.NOT_FOUND
        ) || (
                status == HttpStatusCode.NOT_FOUND.getStatusCode()
                        && expectedStatusCode == HttpStatusCode.FORBIDDEN
        );
    }

    protected JsonApiDocument responseDocument() {
        try {
            return JSON_MAPPER.readJsonApiDocument(response.getBody());
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    protected Data<Resource> getDataFromResponse() {
        return responseDocument().getData();
    }

    protected boolean expectedStatusCodeHasBody() {
        return expectedStatusCode == HttpStatusCode.OK
                || expectedStatusCode == HttpStatusCode.CREATED
                ;
    }

    protected boolean expectedStatusCodeIsSuccess() {
        return expectedStatusCodeHasBody()
                || expectedStatusCode == HttpStatusCode.NO_CONTENT
                ;
    }

    protected EntityCollection getParentCollectionFor(Entity entity) {
        List<GraphNode> lineage = entity.getLineageNodes();
        int lineageDepth = lineage.size();
        return (EntityCollection) lineage.get(lineageDepth - 1);
    }

    protected String getRelevantPath(Entity entity) {
        EntityCollection collection = getParentCollectionFor(entity);
        String base = "/" + collection.getFieldNameForCollection();

        if (!collection.getLineageNodes().isEmpty()) {
            int lineageSize = collection.getLineageNodes().size();
            Entity parent = (Entity) collection.getLineageNodes().get(lineageSize - 1);
            base = parent.getEntityType() + "/" + parent.getId() + base;
        }

        return base + "/" + entity.getId();
    }

    @Override
    public String toString() {
        return getId() + "\t"
                + "User: " + opaqueUser + "\t"
                + String.format("%16s", ruleName() + ":") + "\t"
                + String.format("%7s", requestMethod.toString()) + "\t"
                + getValidationPath() + "\t"
                + "Expected: " + expectedStatusCode.getStatusCode() + "\t"
                + "Received: " + (response != null ? response.getResponseCode() : "???") + "\t"
                ;

    }
}
