/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.configuration;

import com.yahoo.elide.testing.framework.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Holds entity configuration specified in the feature file.
 */
@AllArgsConstructor
public class EntityConfiguration {
    @Getter private String entityName;
    @Getter private Map<Permission, List<String>> permittedIdsByPermission;
    @Getter private Map<String, Set<String>> cannotReadFieldListByInstance;
    @Getter private Map<String, Set<String>> cannotWriteFieldListByInstance;

    public void mergeWithConfiguration(EntityConfiguration otherConfig) {
        if (!entityName.equals(otherConfig.entityName)) {
            throw new IllegalArgumentException("Cannot merge configurations for different entities");
        }

        mergePermittedIdsLists(otherConfig);
        mergeFieldLists(cannotReadFieldListByInstance, otherConfig.cannotReadFieldListByInstance);
        mergeFieldLists(cannotWriteFieldListByInstance, otherConfig.cannotWriteFieldListByInstance);
    }

    private void mergePermittedIdsLists(EntityConfiguration otherConfig) {
        for (Permission permission : Permission.values()) {
            List<String> ids = otherConfig.permittedIdsByPermission.get(permission);
            if (ids == null) {
                continue;
            }

            if (permittedIdsByPermission.containsKey(permission)) {
                permittedIdsByPermission.get(permission).addAll(ids);
            } else {
                permittedIdsByPermission.put(permission, ids);
            }
        }
    }

    private void mergeFieldLists(Map<String, Set<String>> thisFieldList, Map<String, Set<String>> otherFieldList) {
        for (Map.Entry<String, Set<String>> entry : otherFieldList.entrySet()) {
            if (thisFieldList.containsKey(entry.getKey())) {
                throw new IllegalStateException(
                        String.format("Configuration contains the same <entity, id> pair more than once: <%s, %s>",
                                entityName, entry.getKey())
                );
            }

            thisFieldList.put(entry.getKey(), entry.getValue());
        }
    }

    @Override
    public String toString() {
        String repr = "EntityConfiguration{entityName='" + entityName + "'}\n";
        for (Permission permission : permittedIdsByPermission.keySet()) {
            repr += permission + "=" + StringUtils.join(permittedIdsByPermission.get(permission), ",") + '\n';
        }
        for (String id : cannotReadFieldListByInstance.keySet()) {
            repr += id + " \u00ACread -> " + StringUtils.join(cannotReadFieldListByInstance.get(id), ",") + '\n';
            repr += '\t' + " \u00ACwrite -> " + StringUtils.join(cannotWriteFieldListByInstance.get(id), ",") + '\n';
        }

        return  repr;
    }
}
