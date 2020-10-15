/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.beans;

import com.yahoo.elide.testing.framework.example.checks.HasParents;
import com.yahoo.elide.testing.framework.example.checks.IsPartOfFamily;
import com.yahoo.elide.testing.framework.example.checks.IsChildOfFriend;
import com.yahoo.elide.annotation.CreatePermission;
import com.yahoo.elide.annotation.DeletePermission;
import com.yahoo.elide.annotation.Include;
import com.yahoo.elide.annotation.ReadPermission;
import com.yahoo.elide.annotation.SharePermission;
import com.yahoo.elide.annotation.UpdatePermission;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;

/**
 * An example bean for testing.
 */
@Entity
@Include
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)

@ReadPermission(any = { IsPartOfFamily.AtOperation.class, IsChildOfFriend.AtOperation.class })
@CreatePermission(all = { HasParents.AtCommit.class, IsPartOfFamily.AtCommit.class })
@UpdatePermission(all = { IsPartOfFamily.AtCommit.class })
@DeletePermission(all = { IsPartOfFamily.AtOperation.class }) // I brought you into this world, I can take you out of it
@SharePermission(any = { IsPartOfFamily.AtCommit.class, IsChildOfFriend.AtOperation.class })

// TODO: Add auditing for delete only railsplitter core resolves ADFLURMOBL-1165
public class Child extends Human {
    private String ssn = "000-00-0000";
    private Set<Parent> parents = new HashSet<>();
    private Set<Child> playmates = new HashSet<>();

    @ManyToMany(
            targetEntity = Parent.class,
            mappedBy = "children",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    public Set<Parent> getParents() {
        return parents;
    }
    public void setParents(Set<Parent> parents) {
        this.parents = parents;
    }

    @ManyToMany(targetEntity = Child.class)
    @UpdatePermission(any = { IsPartOfFamily.AtCommit.class, IsChildOfFriend.AtOperation.class })
    public Set<Child> getPlaymates() {
        return playmates;
    }
    public void setPlaymates(Set<Child> playmates) {
        this.playmates = playmates;
    }

    /*@Audit(action = Audit.Action.UPDATE,
            operation = 1,
            logStatement = "UPDATE Child {0} Parent {1}",
            logExpressions = {"${child.id}", "${parent.id}"}
    )*/

    @Override
    public String toString() {
        return String.format("Child#%d", id);
    }
}
