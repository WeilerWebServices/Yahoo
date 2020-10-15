/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers.datastore;


import com.yahoo.elide.testing.framework.example.beans.Child;
import com.yahoo.elide.testing.framework.example.beans.Human;
import com.yahoo.elide.testing.framework.example.beans.Parent;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Deep copy people for the testing DataStore.
 */
public class CloningTank {
    /*
     * As a cloning tank we really only clone people. For any T where T != Human we'll just return T; sorry!
     */
    public <T> T deepClone(T object) {
        if (object instanceof Human) {
            final Map<String, Human> clones = new HashMap<>(16);
            return (T) cloneHuman((Human) object, clones);
        }
        return object;
    }

    private String getCloneKey(Human toClone) {
        return String.format("%s#%d", toClone.getClass().getSimpleName(), toClone.getId());
    }

    private Human cloneHuman(Human toClone, Map<String, Human> clones) {
        Human clone = null;
        if (toClone instanceof Parent) {
            clone = cloneParent((Parent) toClone, clones);
        } else if (toClone instanceof Child) {
            clone = cloneChild((Child) toClone, clones);
        }

        return clone;
    }

    private <T extends Human> T getClonedPerson(T toClone, Map<String, Human> clones) {
        return (T) clones.get(getCloneKey(toClone));
    }

    private void genericCloning(Human toClone, Human clone, Map<String, Human> clones) {
        clone.setId(toClone.getId());
        clone.setFirstName(toClone.getFirstName());
        clone.setLastName(toClone.getLastName());
        clone.setAge(toClone.getAge());

        clones.put(getCloneKey(clone), clone);
    }

    private Parent cloneParent(Parent toClone, Map<String, Human> clones) {
        if (toClone == null) {
            return null;
        }
        if (clones.containsKey(getCloneKey(toClone))) {
            return getClonedPerson(toClone, clones);
        }

        Parent clone = new Parent();
        genericCloning(toClone, clone, clones);

        clone.setSpouse(cloneParent(toClone.getSpouse(), clones));

        Set<Parent> friends = toClone.getFriends()
                                     .stream()
                                     .map(p -> cloneParent(p, clones))
                                     .collect(Collectors.toSet());
        clone.setFriends(friends);

        Set<Parent> otherSpouses = toClone.getOtherSpouses()
                                          .stream()
                                          .map(p -> cloneParent(p, clones))
                                          .collect(Collectors.toSet());
        clone.setOtherSpouses(otherSpouses);

        Set<Child> children = toClone.getChildren()
                                     .stream()
                                     .map(c -> cloneChild(c, clones))
                                     .collect(Collectors.toSet());
        clone.setChildren(children);

        return clone;
    }

    private Child cloneChild(Child toClone, Map<String, Human> clones) {
        if (toClone == null) {
            return null;
        }
        if (clones.containsKey(getCloneKey(toClone))) {
            return getClonedPerson(toClone, clones);
        }

        Child clone = new Child();
        genericCloning(toClone, clone, clones);

        Set<Parent> parents = toClone.getParents()
                                     .stream()
                                     .map(p -> cloneParent(p, clones))
                                     .collect(Collectors.toSet());
        clone.setParents(parents);

        Set<Child> playmates = toClone.getPlaymates()
                                      .stream()
                                      .map(c -> cloneChild(c, clones))
                                      .collect(Collectors.toSet());
        clone.setPlaymates(playmates);

        return clone;
    }
}
