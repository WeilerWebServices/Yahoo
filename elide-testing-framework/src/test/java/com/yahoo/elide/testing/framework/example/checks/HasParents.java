/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.checks;

import com.yahoo.elide.security.ChangeSpec;
import com.yahoo.elide.security.RequestScope;
import com.yahoo.elide.security.checks.CommitCheck;
import com.yahoo.elide.security.checks.OperationCheck;
import com.yahoo.elide.testing.framework.example.beans.Child;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/**
 * Verify that the child has parents.
 */
@Slf4j
public class HasParents {

    private static boolean check(Child child) {
        if (child.getParents() != null && !child.getParents().isEmpty()) {
            return true;
        }

        log.debug("Child {} has no parents.", child);
        return false;
    }

    public static class AtCommit extends CommitCheck<Child> {
        @Override
        public boolean ok(Child child, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(child);
        }
    }

    public static class AtOperation extends OperationCheck<Child> {
        @Override
        public boolean ok(Child child, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(child);
        }
    }
}
