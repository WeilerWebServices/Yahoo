/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.checks;

import com.yahoo.elide.security.ChangeSpec;
import com.yahoo.elide.security.RequestScope;
import com.yahoo.elide.security.checks.OperationCheck;
import com.yahoo.elide.testing.framework.example.beans.Human;
import com.yahoo.elide.testing.framework.example.beans.Parent;

import java.util.Optional;

/**
 * Example check asserting that the user is the current entity being accessed.
 */
public class IdentityCheck extends OperationCheck<Human> {
    @Override
    public boolean ok(Human object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
        Parent user = (Parent) requestScope.getUser().getOpaqueUser();
        return user.equals(object);
    }
}
