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
import com.yahoo.elide.testing.framework.example.beans.Parent;

import java.util.Optional;
import java.util.Set;

/**
 * Children can be seen by their parents' friends.
 */

public class IsChildOfFriend {
    private static boolean check(Child object, RequestScope requestScope) {
        Parent user = (Parent) requestScope.getUser().getOpaqueUser();

        Set<Parent> friends = user.getFriends();
        Set<Parent> parents = object.getParents();
        for (Parent parent : parents) {
            if (friends.contains(parent)) {
                return true;
            }
        }

        return false;
    }

    public static class AtCommit extends CommitCheck<Child> {
        @Override
        public boolean ok(Child object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(object, requestScope);
        }
    }

    public static class AtOperation extends OperationCheck<Child> {
        @Override
        public boolean ok(Child object, RequestScope requestScope, Optional<ChangeSpec> changeSpec) {
            return check(object, requestScope);
        }
    }
}
