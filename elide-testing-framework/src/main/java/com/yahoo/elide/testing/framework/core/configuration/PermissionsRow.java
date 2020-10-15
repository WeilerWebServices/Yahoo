/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import com.yahoo.elide.testing.framework.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * A data structure that describes permissions a particular user can have on an entity.
 */
@AllArgsConstructor
public class PermissionsRow {
    @Getter private String userName;
    @Getter private String entityName;

    @Getter private String validIdsExpression;

    @Getter private List<Permission> entityPermissions;
    @Getter private String readRestrictedFields;
    @Getter private String writeRestrictedFields;
}
