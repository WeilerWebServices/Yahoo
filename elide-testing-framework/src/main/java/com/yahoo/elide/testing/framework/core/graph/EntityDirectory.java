/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import java.util.Set;

/**
 * Provides methods to look up entities by type and ID.
 */
public interface EntityDirectory {
    public Set<String> getAllIds(String type);
    public Set<Entity> getFilteredEntitiesOfType(String type, Set<String> permittedIds);
    public Set<Entity> getAllEntitiesOfType(String type);
}
