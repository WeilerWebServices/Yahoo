/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;

/**
 * The interface for visitors.
 */
public interface Visitor {
    void visitEntity(Entity entity);
    void visitEntityCollection(EntityCollection entityCollection);
    void visitEntityGraph(EntityGraph entityGraph);
}
