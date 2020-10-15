/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers.user;

import com.yahoo.elide.testing.framework.example.beans.Parent;
import com.yahoo.elide.testing.framework.core.UserFactory;
import com.google.common.collect.Sets;
import com.yahoo.elide.security.User;

import java.util.Set;

/**
 * Genrerate users for sample feature file.
 */
public class TestUserFactory implements UserFactory {
    // Surnames
    public static final String BONHAM = "Bonham";
    public static final String AMALBERTI = "Amalberti";
    public static final String TANG = "Tang";

    // Parents
    public static final String MO = "Mo";
    public static final String MARGERY = "Margery";
    public static final String EMMANUEL = "Emmanuel";
    public static final String GORAN = "Goran";
    public static final String HINA = "Hina";

    @Override
    public User makeUser(String alias) {
        return makeSampleUser(alias);
    }

    public static User makeSampleUser(String alias) {
        long id;
        String firstName, lastName;
        Set<Parent> friends;

        switch (alias) {
            case MO:
                id = 1;
                firstName = MO;
                lastName = BONHAM;
                friends = Sets.newHashSet(getParent(3, EMMANUEL, AMALBERTI, null));
                break;

            case MARGERY:
                id = 2;
                firstName = MARGERY;
                lastName = BONHAM;
                friends = Sets.newHashSet(getParent(3, EMMANUEL, AMALBERTI, null));
                break;

            case EMMANUEL:
                id = 3;
                firstName = EMMANUEL;
                lastName = AMALBERTI;
                friends = Sets.newHashSet(
                        getParent(1, MO, BONHAM, null),
                        getParent(2, MARGERY, BONHAM, null),
                        getParent(4, GORAN, TANG, null),
                        getParent(5, HINA, TANG, null)
                );
                break;

            case GORAN:
                id = 4;
                firstName = GORAN;
                lastName = TANG;
                friends = Sets.newHashSet(getParent(3, EMMANUEL, AMALBERTI, null));
                break;

            case HINA:
                id = 5;
                firstName = HINA;
                lastName = TANG;
                friends = Sets.newHashSet(getParent(3, EMMANUEL, AMALBERTI, null));
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid Username: " + alias + " provided in the configuration file."
                );
        }

        return new User(getParent(id, firstName, lastName, friends));
    }

    private static Parent getParent(long id, String firstName, String lastName, Set<Parent> friends) {
        Parent p = new Parent();

        p.setId(id);
        p.setFirstName(firstName);
        p.setLastName(lastName);
        p.setFriends(friends);

        return p;
    }
}
