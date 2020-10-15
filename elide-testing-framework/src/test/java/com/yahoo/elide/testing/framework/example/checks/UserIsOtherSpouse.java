/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.checks;

import com.yahoo.elide.security.ChangeSpec;
import com.yahoo.elide.security.RequestScope;
import com.yahoo.elide.security.checks.OperationCheck;
import com.yahoo.elide.testing.framework.example.beans.Parent;

import java.util.Optional;

/**
 * Security check to verify that a user has an OtherSpouse relationship with the record.
 */
public class UserIsOtherSpouse extends OperationCheck<Parent> {
    @Override
    public boolean ok(Parent object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
        Parent user = (Parent) requestScope.getUser().getOpaqueUser();

        for (Parent p : object.getOtherSpouses()) {
            if (p.equals(user)) {
                return true;
            }
        }

        return false;
    }
}
