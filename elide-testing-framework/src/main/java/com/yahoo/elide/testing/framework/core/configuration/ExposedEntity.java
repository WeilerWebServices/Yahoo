/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Data read out of the feature file.
 */
@AllArgsConstructor
public class ExposedEntity {
    @Getter private String entityName;
    @Getter private boolean rootable;
}
