/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.example.beans;

import com.yahoo.elide.annotation.UpdatePermission;
import com.yahoo.elide.security.checks.prefab.Role;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

/**
 * Example base class for testing data.
 */
@MappedSuperclass
public abstract class Human {
    @Getter(onMethod = @__({@Id, @GeneratedValue}))
    @Setter protected long id;

    protected boolean deceased = false;
    @UpdatePermission(any = { Role.NONE.class })
    public boolean isDeceased() {
        return deceased;
    }
    public void setDeceased(boolean deceased) {
        this.deceased = deceased;
    }

    @Getter @Setter protected int age;
    @Getter @Setter protected String firstName;
    @Getter @Setter protected String lastName;

    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }

        if (!obj.getClass().equals(this.getClass())) {
            return false;
        }

        Human other = (Human) obj;

        return this.getId() == other.getId();
    }

    @Override
    public int hashCode() {

        return Long.hashCode(id);
    }
}
