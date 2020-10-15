/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;
import lombok.Getter;

import java.util.SortedSet;

/**
 * Represents the data we crawl out of the user provided dataset.
 */
public class EntityGraph implements Visitable {

    @Getter private SortedSet<EntityCollection> rootCollectionsList;

    public EntityGraph(SortedSet<EntityCollection> rootCollectionsList) {
        this.rootCollectionsList = rootCollectionsList;
    }

    /**
     * Calls accept on each root collection (EntityCollection).
     */
    @Override
    public void accept(Visitor visitor, UserProfile forUser) {
        visitor.visitEntityGraph(this);
        for (EntityCollection entityCollection : rootCollectionsList) {
            entityCollection.accept(visitor, forUser);
        }
    }
}
