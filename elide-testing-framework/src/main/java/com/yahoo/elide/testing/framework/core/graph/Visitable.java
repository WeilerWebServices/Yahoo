/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;

/**
 * The interface for graph objects.
 */
public interface Visitable {
    void accept(Visitor visitor, UserProfile forUser);
}
