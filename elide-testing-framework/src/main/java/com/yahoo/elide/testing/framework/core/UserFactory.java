/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core;
import com.yahoo.elide.security.User;

/**
 * The interface for translating a user's alias in the feature file to an Elide.User object.
 */
public interface UserFactory {
    User makeUser(String alias);
}
