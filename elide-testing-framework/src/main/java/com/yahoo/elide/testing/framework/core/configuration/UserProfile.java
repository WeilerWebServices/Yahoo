/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import com.yahoo.elide.testing.framework.enums.Permission;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.security.User;
import lombok.Getter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Describes the set of actions that a user can take on the sample data.
 */
public class UserProfile implements Comparable<UserProfile> {

    @Getter private User user;
    @Getter private Map<String, EntityConfiguration> entityConfigurations = new HashMap<>();

    public UserProfile(User user, Map<String, EntityConfiguration> entityConfigurations) {
        this.user = user;
        if (entityConfigurations != null) {
            this.entityConfigurations = entityConfigurations;
        }
    }


    public List<String> getIdListForPermission(String entityType, Permission permission) {
        List<String> idList = new ArrayList<>();

        if (entityHasPermittedIdsForPermission(entityType, permission)) {
            idList = entityConfigurations.get(entityType).getPermittedIdsByPermission().get(permission);
        }

        return idList;
    }

    private boolean entityHasPermittedIdsForPermission(String entityName, Permission permission) {
        return entityConfigurations.get(entityName) != null
                && entityConfigurations.get(entityName).getPermittedIdsByPermission() != null
                && entityConfigurations.get(entityName).getPermittedIdsByPermission().get(permission) != null
                ;
    }

    public boolean hasAccessToEntityForPermission(Entity entity, Permission permission) {
        String id = entity.getId();
        String entityType = entity.getEntityType();
        return entityHasPermittedIdsForPermission(entityType, permission)
                && entityConfigurations.get(entityType).getPermittedIdsByPermission().get(permission).contains(id)
                ;
    }

    public boolean hasAccessToEntityFieldForPermission(Entity entity, String field, Permission permission) {
        EntityConfiguration configuration = entityConfigurations.get(entity.getEntityType());
        if (configuration == null) {
            return false;
        }

        String id = entity.getId();
        if (permission == Permission.READ) {
            return !hasReadRestrictedFieldsFor(configuration, id)
                    || (!isReadRestrictedFieldFor(field, configuration, id))
                    ;
        }

        return !hasWriteRestrictedFieldsFor(configuration, id)
                || (!isWriteRestrictedFieldFor(field, configuration, id))
                ;
    }

    protected boolean hasReadRestrictedFieldsFor(EntityConfiguration configuration, String id) {
        return configuration.getCannotReadFieldListByInstance().containsKey(id);
    }

    protected boolean isReadRestrictedFieldFor(String field, EntityConfiguration configuration, String id) {
        return configuration.getCannotReadFieldListByInstance().get(id).contains(field);
    }

    private boolean hasWriteRestrictedFieldsFor(EntityConfiguration configuration, String id) {
        return configuration.getCannotWriteFieldListByInstance().containsKey(id);
    }

    private boolean isWriteRestrictedFieldFor(String field, EntityConfiguration configuration, String id) {
        return configuration.getCannotWriteFieldListByInstance().get(id).contains(field);
    }

    public Set<String> getHiddenFieldsForPermission(Entity entity, Permission permission) {
        EntityConfiguration configuration = entityConfigurations.get(entity.getEntityType());
        if (configuration == null) {
            return new HashSet<>();
        }

        if (!hasAccessToEntityForPermission(entity, permission)) {
            return entity.getAllFieldNames();
        }

        String id = entity.getId();
        if (permission == Permission.READ && hasReadRestrictedFieldsFor(configuration, id)) {
            return new HashSet<>(configuration.getCannotReadFieldListByInstance().get(id));
        } else if (permission != Permission.READ && hasWriteRestrictedFieldsFor(configuration, id)) {
            return new HashSet<>(configuration.getCannotWriteFieldListByInstance().get(id));
        }

        return new HashSet<>();
    }

    @Override
    public String toString() {
        return "UserProfile{" + user.getOpaqueUser() + "}";
    }

    @Override
    public int compareTo(UserProfile other) {
        return user.getOpaqueUser().toString().compareTo(other.user.getOpaqueUser().toString());
    }
}
