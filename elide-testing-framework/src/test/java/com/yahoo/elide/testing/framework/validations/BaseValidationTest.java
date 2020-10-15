/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.Elide;
import com.yahoo.elide.audit.Slf4jLogger;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Resource;
import com.yahoo.elide.security.User;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.GraphNode;
import com.yahoo.elide.testing.framework.enums.HttpMethod;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.helpers.SetupTestDataDriver;
import com.yahoo.elide.testing.framework.helpers.hibernate.InMemoryDB;
import com.yahoo.elide.testing.framework.helpers.user.Names;
import com.yahoo.elide.testing.framework.helpers.user.TestEntityFactory;
import com.yahoo.elide.testing.framework.core.elide.override.ReadOnlyDataStore;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Common code for testing validations.
 */
public abstract class BaseValidationTest {
    protected URI uri;
    protected HttpMethod requestMethod;
    protected HttpStatusCode successStatusCode;

    protected Elide elide;
    protected UserProfile profile;
    protected Object opaqueUser;

    protected Entity entity;
    protected Validation validation;

    protected void setup(String userAlias) throws IOException {
        SetupTestDataDriver testDataDriver = SetupTestDataDriver.getInstance();

        EntityDictionary dictionary = testDataDriver.getEntityDictionary();
        InMemoryDB database = testDataDriver.getDataStore();
        ReadOnlyDataStore dataStore = new ReadOnlyDataStore(database);
        this.elide = new Elide(new Slf4jLogger(), dataStore, dictionary);

        this.profile = selectProfileFor(testDataDriver.getDriver().getProfiles(), userAlias);
    }

    private UserProfile selectProfileFor(List<UserProfile> profiles, String userAlias) {
        User user = TestUserFactory.makeSampleUser(userAlias);
        Object opaqueUser = user.getOpaqueUser();

        for (UserProfile profile : profiles) {
            if (profile.getUser().getOpaqueUser().equals(opaqueUser)) {
                this.opaqueUser = opaqueUser;
                return profile;
            }
        }

        return null;
    }

    protected boolean getValidationResult(Validation validation) {
        return getValidationResult(validation, false);
    }

    protected boolean getValidationResult(Validation validation, boolean logResponse) {
        ValidationResult result = validation.execute(elide);
        return result.getTestResult();
    }

    protected List<GraphNode> lineageIncludingNode(GraphNode node) {
        List<GraphNode> lineage = new ArrayList<>(node.getLineageNodes());
        lineage.add(node);
        return lineage;
    }

    protected Entity getEntityInCollection(EntityCollection collection, Names name) {
        List<GraphNode> emmanuelLineage = lineageIncludingNode(collection);
        return TestEntityFactory.generatePersonWithLineage(name, emmanuelLineage);
    }

    protected EntityCollection getCollectionOnEntity(Entity entity, String collectionName) {
        return entity.getRelationshipToCollectionMap().get(collectionName);
    }

    protected Data<Resource> getDataOfTypeWithIds(String entityType, boolean isToOne, String... ids) {
        if (isToOne) {
            Resource resource = null;

            if (ids.length > 0) {
                resource = new Resource(entityType, ids[0]);
            }

            return new Data<>(resource);
        } else {
            Set<Resource> resources = new HashSet<>(ids.length);

            for (String id : ids) {
                resources.add(new Resource(entityType, id));
            }

            return new Data<>(resources);
        }
    }

    public abstract void testExecute() throws Exception;
    public abstract void testExecuteNotFound() throws Exception;
    public abstract void testExecuteForbiddenAccess() throws Exception;
    public abstract void testToString() throws Exception;

    protected String baseVisitorToString(Validation validation) {
        return "User: " + profile.getUser().getOpaqueUser().toString() + "\t"
                + validation.ruleName() + "\t"
                + String.format("%7s", requestMethod.toString()) + "\t"
                + uri.toString() + "\t"
                + "Expected: " + successStatusCode.getStatusCode() + "\t"
                + "Received: " + validation.response.getResponseCode() + "\t";
    }
}
