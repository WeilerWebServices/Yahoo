/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.checks;

import com.yahoo.elide.security.ChangeSpec;
import com.yahoo.elide.security.RequestScope;
import com.yahoo.elide.security.checks.CommitCheck;
import com.yahoo.elide.security.checks.OperationCheck;
import com.yahoo.elide.testing.framework.example.beans.Human;
import com.yahoo.elide.testing.framework.example.beans.Parent;

import java.util.Optional;


/**
 * Security check to verify that the user's surname matches the record's surname.
 */
public class IsPartOfFamily {

    private static boolean check(Human object, RequestScope requestScope) {
        try {
            Parent user = (Parent) requestScope.getUser().getOpaqueUser();
            String recordSurname = object.getLastName();

            return user.getLastName().equals(recordSurname);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static class AtCommit extends CommitCheck<Human> {
        @Override
        public boolean ok(Human object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(object, requestScope);
        }
    }

    public static class AtOperation extends OperationCheck<Human> {
        @Override
        public boolean ok(Human object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(object, requestScope);
        }
    }
}
