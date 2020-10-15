/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.cucumber;

import com.yahoo.elide.testing.framework.core.configuration.ExposedEntity;
import com.yahoo.elide.testing.framework.core.configuration.PermissionsRow;
import com.yahoo.elide.testing.framework.enums.Permission;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import lombok.Getter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.Stack;
import java.util.stream.Collectors;

/**
 * The glue code for parsing the feature file.
 */
public class StepDefinitions {
    static private String ENTITY_NAME_KEY = "EntityName";
    static private String ROOTABLE_KEY = "Rootable";
    static private String USER_ALIAS_KEY = "UserName";
    static private String VALID_IDS_KEY = "ValidIdsList";
    static private String ENTITY_PERMISSIONS_KEY = "EntityPermissions";
    static private String RESTRICTED_READ_FIELDS = "RestrictedReadFields";
    static private String RESTRICTED_WRITE_FIELDS = "RestrictedWriteFields";

    @Getter private List<String> disabledValidations = new ArrayList<>();
    @Getter private List<String> usersList = new ArrayList<>();
    @Getter private List<ExposedEntity> exposedEntityList = new ArrayList<>();
    @Getter private List<PermissionsRow> associatedPermissionsRowList = new ArrayList<>();
    @Getter private Map<String, String> expandedAliases = new HashMap<>();

    @Given("^exposed entities$")
    public void exposedEntities(final List<Map<String, String>> exposedEntitites) {
        for (Map<String, String> exposedEntityItem : exposedEntitites) {
            ExposedEntity exposedEntity = getExposedEntityFromEntityDefinition(exposedEntityItem);
            exposedEntityList.add(exposedEntity);
        }
    }

    private ExposedEntity getExposedEntityFromEntityDefinition(Map<String, String> entityDefinition) {
        String name = entityDefinition.get(ENTITY_NAME_KEY);
        boolean rootable = entityDefinition.get(ROOTABLE_KEY).equalsIgnoreCase("true");
        return new ExposedEntity(name, rootable);
    }

    @Given("^users$")
    public void usersList(final List<String> users) {
        for (String userAlias : users) {
            if (!userAlias.isEmpty()) {
                this.usersList.add(userAlias);
            }
        }
    }

    @Given("^associated permissions$")
    public void associatedPermissions(final List<Map<String, String>> permissionsTable) {
        for (Map<String, String> permissionsRow : permissionsTable) {
            PermissionsRow row = getPermissionRowFromPermissionsTableRow(permissionsRow);
            associatedPermissionsRowList.add(row);
        }
    }

    @Given("^aliases$")
    public void aliases(final Map<String, String> aliasTable) {
        Map<String, List<String>> aliases = new HashMap<>();
        for (Map.Entry<String, String> kvp : aliasTable.entrySet()) {
            aliases.put(kvp.getKey(), splitStringField(kvp.getValue()));
        }

        for (String alias : aliases.keySet()) {
            Set<String> expanded = expandAliases(alias, aliases);
            expandedAliases.put(alias, String.join(",", expanded));
        }
    }

    private PermissionsRow getPermissionRowFromPermissionsTableRow(Map<String, String> permission) {
        String user = getUserAliasFromPermissionDefinition(permission);
        String entity = getEntityNameFromPermissionDefinition(permission);
        String validIdsExpression = variableSubstitute(permission.get(VALID_IDS_KEY), expandedAliases);
        List<Permission> entityPermissions = getEntityPermissionsFromPermissionDefinition(permission);
        String readRestrictedFields = permission.get(RESTRICTED_READ_FIELDS);
        String writeRestrictedFields = permission.get(RESTRICTED_WRITE_FIELDS);

        return new PermissionsRow(
                user,
                entity,
                validIdsExpression,
                entityPermissions,
                readRestrictedFields,
                writeRestrictedFields
        );
    }

    private String getUserAliasFromPermissionDefinition(Map<String, String> permission) {
        return permission.get(USER_ALIAS_KEY);
    }

    private String getEntityNameFromPermissionDefinition(Map<String, String> permission) {
        return permission.get(ENTITY_NAME_KEY);
    }

    private List<Permission> getEntityPermissionsFromPermissionDefinition(Map<String, String> permission) {
        List<Permission> entityPermissions = new ArrayList<>();

        String [] permissionStrings = permission.get(ENTITY_PERMISSIONS_KEY).split(",");
        for (String permissionString : permissionStrings) {
            if (!permissionString.isEmpty()) {
                entityPermissions.add(Permission.valueOf(permissionString.toUpperCase(Locale.ENGLISH))
                );
            }
        }
        return entityPermissions;
    }

    private List<String> splitStringField(String fieldData) {
        List<String> entries = new ArrayList<>();

        String [] fieldEntryList = fieldData.split(",");
        for (String entry : fieldEntryList) {
            if (!entry.isEmpty()) {
                entries.add(entry);
            }
        }

        return entries;
    }

    @Given("^disabled test ids$")
    public void givenDisabledTestIds(List<String> ids) {
        disabledValidations = new ArrayList<>(ids);
    }

    @Then("^send data to the Validation Driver$")
    public void sendDataToValidationDriver() {
        CucumberParser.stepDefinitions = this;
    }

    private static Set<String> expandAliases(String toExpand, Map<String, List<String>> aliases) {

        Stack<String> remainingToExpand = new Stack<>();
        Set<String> visited = new HashSet<>();
        Set<String> toReturn = new HashSet<>();

        remainingToExpand.add(toExpand);

        while (!remainingToExpand.isEmpty())  {
            String nextExpansion = remainingToExpand.pop();

            if (aliases.containsKey(nextExpansion)) {
                if (visited.contains(nextExpansion)) {
                    throw new IllegalArgumentException("Cycle found during alias expansion");
                }
                visited.add(nextExpansion);
                remainingToExpand.addAll(aliases.get(nextExpansion));
            } else {
                toReturn.add(nextExpansion);
            }
        }

        return toReturn;
    }

    private static String variableSubstitute(String template, Map<String, String> aliases) {

        /*
         * Always substitute from longest alias to shortest in case one alias contains another.
         */
        List<String> sortedAliases = aliases.keySet()
                .stream()
                .sorted((s1, s2) -> { return Integer.compare(s2.length(), s1.length()); })
                .collect(Collectors.toList());

        for (String alias : sortedAliases) {
            template = template.replace(alias, aliases.get(alias));
        }
        return template;
    }
}
