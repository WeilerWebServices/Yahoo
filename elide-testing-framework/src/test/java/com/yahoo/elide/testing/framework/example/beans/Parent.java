/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.beans;

import com.yahoo.elide.annotation.CreatePermission;
import com.yahoo.elide.annotation.DeletePermission;
import com.yahoo.elide.annotation.Include;
import com.yahoo.elide.annotation.ReadPermission;
import com.yahoo.elide.annotation.SharePermission;
import com.yahoo.elide.annotation.UpdatePermission;
import com.yahoo.elide.security.checks.prefab.Role;
import com.yahoo.elide.testing.framework.example.checks.IdentityCheck;
import com.yahoo.elide.testing.framework.example.checks.IsPartOfFamily;
import com.yahoo.elide.testing.framework.example.checks.UserIsOtherSpouse;
import lombok.NonNull;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import java.util.HashSet;
import java.util.Set;

/**
 * An example bean for testing.
 */
@Entity
@Include(rootLevel = true, type = "parent") // optional here because class has this name
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)

@ReadPermission(any = { Role.ALL.class })
@CreatePermission(any = { IsPartOfFamily.AtCommit.class })
@UpdatePermission(any = { IsPartOfFamily.AtCommit.class })
@DeletePermission(any = { Role.NONE.class })
@SharePermission(any = { Role.ALL.class })
public class Parent extends Human {
    private Parent spouse;
    private Set<Child> children = new HashSet<>();
    private Set<Parent> otherSpouses = new HashSet<>();
    private Set<Parent> friends = new HashSet<>();

    @OneToOne(targetEntity = Parent.class)
    public Parent getSpouse() {
        return spouse;
    }
    public void setSpouse(Parent spouse) {
        this.spouse = spouse;
    }

    @ManyToMany(targetEntity = Child.class,
            cascade = { CascadeType.PERSIST, CascadeType.MERGE }
    )
    @JoinTable(
            name = "Parent_Child",
            joinColumns = @JoinColumn(name = "parent_id"),
            inverseJoinColumns = @JoinColumn(name = "child_id")
    )
    public Set<Child> getChildren() {
        return children;
    }
    public void setChildren(@NonNull Set<Child> children) {
        this.children = children;
    }

    @ManyToMany(targetEntity = Parent.class, mappedBy = "friends")
    @UpdatePermission(any = { Role.ALL.class })
    public Set<Parent> getFriends() {
        return friends;
    }
    public void setFriends(Set<Parent> friends) {
        this.friends = friends;
    }

    @ManyToMany(targetEntity = Parent.class, mappedBy = "otherSpouses")
    @ReadPermission(any = { IdentityCheck.class, UserIsOtherSpouse.class })
    @UpdatePermission(any = { IdentityCheck.class, UserIsOtherSpouse.class })
    public Set<Parent> getOtherSpouses() {
        return otherSpouses;
    }
    public void setOtherSpouses(Set<Parent> otherSpouses) {
        this.otherSpouses = otherSpouses;
    }

    @Override
    public String toString() {
        return "Parent#" + Long.toString(id);
    }
}
