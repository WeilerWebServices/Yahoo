/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.visitors.EntityGraph;

import com.yahoo.elide.testing.framework.core.ValidationPlan;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.graph.Entity;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.enums.HttpStatusCode;
import com.yahoo.elide.testing.framework.enums.Permission;
import com.yahoo.elide.testing.framework.enums.Visibility;
import com.yahoo.elide.testing.framework.validations.CollectionContentsValidation;
import com.yahoo.elide.testing.framework.validations.CollectionEntryCreatableValidation;
import com.yahoo.elide.testing.framework.validations.EntityAttributeMutabilityValidation;
import com.yahoo.elide.testing.framework.validations.EntityAttributeVisibilityValidation;
import com.yahoo.elide.testing.framework.validations.EntityDeleteabilityValidation;
import com.yahoo.elide.testing.framework.validations.EntityRelationshipCreateableValidation;
import com.yahoo.elide.testing.framework.validations.EntityRelationshipDeleteableValidation;
import com.yahoo.elide.testing.framework.validations.EntityRelationshipVisibilityValidation;
import com.yahoo.elide.testing.framework.validations.EntityVisiblityValidation;
import com.yahoo.elide.testing.framework.validations.Validation;
import com.google.common.collect.Sets;
import com.yahoo.elide.jsonapi.models.Data;
import com.yahoo.elide.jsonapi.models.Relationship;
import com.yahoo.elide.jsonapi.models.Resource;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;

import static com.yahoo.elide.testing.framework.enums.Mutability.MUTABLE;
import static com.yahoo.elide.testing.framework.enums.Mutability.NOT_MUTABLE;

/**
 * Use the entity graph to build the validation plan.
 */
@Slf4j
public class GenerateValidationPlanVisitor implements Visitor {
    @FunctionalInterface
    interface PentaFunction<A, B, C, D, E, R> {
        R apply(A a, B b, C c, D d, E e);
    }

    /**
     * What the visitor builds.
     */
    @Getter
    private ValidationPlan validationPlan;
    @Getter
    private UserProfile userProfile;

    public GenerateValidationPlanVisitor(ValidationPlan validationPlan, UserProfile userProfile) {
        this.validationPlan = validationPlan;
        this.userProfile = userProfile;
    }

    /**
     * Generates validations for an Entity.
     * Validations:
     * - EntityAttributesReadValidation
     * - EntityAttributesUpdateValidation
     * - EntityAttributesProperlyHiddenValidation
     * - EntityRelationshipsReadValidation
     * - EntityRelationshipsUpdateValidation
     * - EntityRelationshipsDeleteValidation
     * - EntityRelationshipsProperlyHiddenValidation
     */
    @Override
    public void visitEntity(Entity entity) {
        if (entity.canBeAccessedByUserForPermission(userProfile, Permission.READ)) {
            validateEntityAttributes(entity);
            validateEntityRelationships(entity);
            validateEntityDeletePermissions(entity);
        } else {
            validateEntityNotVisible(entity);
        }
    }

    private void validateEntityAttributes(Entity entity) {
        validateAttributeVisibility(entity);
        validateAttributeMutability(entity);
    }

    private void validateAttributeVisibility(Entity entity) {
        generateEntityAttributeValidations(
                entity,
                Permission.READ,
                this::validateAttributeVisible,
                this::validateAttributeHidden
        );
    }

    private Validation validateAttributeVisible(Entity entity, String attribute) {
        return new EntityAttributeVisibilityValidation(entity, userProfile, attribute, Visibility.VISIBLE);
    }

    private Validation validateAttributeHidden(Entity entity, String attribute) {
        return new EntityAttributeVisibilityValidation(entity, userProfile, attribute, Visibility.NOT_VISIBLE);
    }

    private void validateAttributeMutability(Entity entity) {
        generateEntityAttributeValidations(
                entity,
                Permission.UPDATE,
                this::validateAttributeMutable,
                this::validateAttributeImmutable
        );
    }

    private Validation validateAttributeMutable(Entity entity, String attribute) {
        return new EntityAttributeMutabilityValidation(entity, userProfile, attribute, MUTABLE);
    }

    private Validation validateAttributeImmutable(Entity entity, String attribute) {
        return new EntityAttributeMutabilityValidation(entity, userProfile, attribute, NOT_MUTABLE);
    }

    private void generateEntityAttributeValidations(Entity entity,
                                                    Permission permission,
                                                    BiFunction<Entity, String, Validation> generateSuccessfulValidation,
                                                    BiFunction<Entity, String, Validation> generateFailingValidation) {
        Set<String> attributes = entity.getAttributeMap().keySet();
        Set<String> hiddenFields = userProfile.getHiddenFieldsForPermission(entity, permission);
        Set<String> authorizedAttributes = Sets.difference(attributes, hiddenFields);
        Set<String> unauthorizedAttributes = Sets.intersection(attributes, hiddenFields);

        for (String attribute : authorizedAttributes) {
            validationPlan.addValidation(() -> generateSuccessfulValidation.apply(entity, attribute));
        }

        for (String attribute : unauthorizedAttributes) {
            validationPlan.addValidation(() -> generateFailingValidation.apply(entity, attribute));
        }
    }

    private void validateEntityRelationships(Entity entity) {
        validateRelationshipVisibility(entity);
        validateRelationshipCreateability(entity);
        validateRelationshipDeleteability(entity);
    }

    private void validateRelationshipVisibility(Entity entity) {
        generateEntityRelationshipValidations(
                entity,
                Permission.READ,
                this::validateAppropriateRelationshipsVisible,
                this::validateAppropriateRelationshipsHidden
        );
    }

    private Validation validateAppropriateRelationshipsVisible(Entity entity,
                                                               String relationship,
                                                               Visibility relationVisible,
                                                               Data<Resource> idsUnderTest,
                                                               Visibility idsVisible) {
        return new EntityRelationshipVisibilityValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private Validation validateAppropriateRelationshipsHidden(Entity entity,
                                                              String relationship,
                                                              Visibility relationVisible,
                                                              Data<Resource> idsUnderTest,
                                                              Visibility idsVisible) {
        return new EntityRelationshipVisibilityValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private void validateRelationshipCreateability(Entity entity) {
        // creating a relationship is not a CREATE operation, it's really an UPDATE
        generateEntityRelationshipValidations(
                entity,
                Permission.UPDATE,
                this::validateMutableRelationshipsCreate,
                this::validateImmutableRelationshipsFailCreate
        );
    }

    private Validation validateMutableRelationshipsCreate(Entity entity,
                                                          String relationship,
                                                          Visibility relationVisible,
                                                          Data<Resource> idsUnderTest,
                                                          Visibility idsVisible) {
        return new EntityRelationshipCreateableValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private Validation validateImmutableRelationshipsFailCreate(Entity entity,
                                                                String relationship,
                                                                Visibility relationVisible,
                                                                Data<Resource> idsUnderTest,
                                                                Visibility idsVisible) {
        return new EntityRelationshipCreateableValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private void validateRelationshipDeleteability(Entity entity) {
        // deleting a relationship is not a DELETE operation, it's really an UPDATE
        generateEntityRelationshipValidations(
                entity,
                Permission.UPDATE,
                this::validateMutableRelationshipsDelete,
                this::validateImmutableRelationshipsFailDelete
        );
    }

    private Validation validateMutableRelationshipsDelete(Entity entity,
                                                          String relationship,
                                                          Visibility relationVisible,
                                                          Data<Resource> idsUnderTest,
                                                          Visibility idsVisible) {
        return new EntityRelationshipDeleteableValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private Validation validateImmutableRelationshipsFailDelete(Entity entity,
                                                                String relationship,
                                                                Visibility relationVisible,
                                                                Data<Resource> idsUnderTest,
                                                                Visibility idsVisible) {
        return new EntityRelationshipDeleteableValidation(
                entity,
                userProfile,
                relationship,
                relationVisible,
                idsUnderTest,
                idsVisible
        );
    }

    private void generateEntityRelationshipValidations(Entity entity,
                                                       Permission permission,
                                                       PentaFunction<Entity, String,
                                                               Visibility, Data<Resource>,
                                                               Visibility, Validation> createValidationThatSucceeds,
                                                       PentaFunction<Entity, String,
                                                               Visibility, Data<Resource>,
                                                               Visibility, Validation> createValidationThatFails) {
        Set<String> relationships = entity.getRelationshipToCollectionMap().keySet();
        Set<String> forbiddenFields = userProfile.getHiddenFieldsForPermission(entity, permission);

        for (String relationship : Sets.difference(relationships, forbiddenFields)) {
            Data<Resource> relationshipData = getRelationshipData(entity, relationship);
            Set<String> permittedIds = getPermittedIdsForRelationship(entity, relationship);

            if (hasPermittedIdsInRelationship(relationshipData, permittedIds)) {
                Data<Resource> permittedRelationshipValues = dataByIncludingIds(relationshipData, permittedIds);
                validationPlan.addValidation(() -> createValidationThatSucceeds.apply(
                        entity,
                        relationship,
                        Visibility.VISIBLE,
                        permittedRelationshipValues,
                        Visibility.VISIBLE
                ));
            }

            if (hasRestrictedIdsInRelationship(relationshipData, permittedIds)) {
                Data<Resource> deniedRelationshipValues = dataByExcludingIds(relationshipData, permittedIds);
                validationPlan.addValidation(() -> createValidationThatFails.apply(
                        entity,
                        relationship,
                        Visibility.VISIBLE,
                        deniedRelationshipValues,
                        Visibility.NOT_VISIBLE
                ));
            }
        }

        for (String relationship : Sets.intersection(relationships, forbiddenFields)) {
            Data<Resource> idsInRelationship = getRelationshipData(entity, relationship);
            validationPlan.addValidation(() -> createValidationThatFails.apply(
                    entity,
                    relationship,
                    Visibility.NOT_VISIBLE,
                    idsInRelationship,
                    Visibility.NOT_VISIBLE
            ));
        }
    }

    private Data<Resource> getRelationshipData(Entity entity, String field) {
        Relationship relationship = entity.getResource().getRelationships().get(field);
        return relationship.getData();
    }

    private Set<String> getPermittedIdsForRelationship(Entity entity, String relationship) {
        String entityType = entity.getRelationshipToCollectionMap().get(relationship).getCollectionEntityType();
        return new HashSet<>(userProfile.getIdListForPermission(entityType, Permission.READ));
    }

    private boolean hasPermittedIdsInRelationship(Data<Resource> relationshipData, Set<String> permittedIds) {
        if (relationshipData == null) {
            return true;
        } else if (relationshipData.isToOne()) {
            return permittedIds.contains(relationshipData.get().iterator().next().getId());
        } else {
            Collection<Resource> contents = relationshipData.get();
            for (Resource resource : contents) {
                if (permittedIds.contains(resource.getId())) {
                    return true;
                }
            }
            return false;
        }
    }

    private boolean hasRestrictedIdsInRelationship(Data<Resource> relationshipData, Set<String> permittedIds) {
        if (relationshipData == null) {
            return false;
        } else if (relationshipData.isToOne()) {
            return !permittedIds.contains(relationshipData.get().iterator().next().getId());
        } else {
            Collection<Resource> contents = relationshipData.get();
            for (Resource resource : contents) {
                if (!permittedIds.contains(resource.getId())) {
                    return true;
                }
            }
            return false;
        }
    }

    private Data<Resource> dataByIncludingIds(Data<Resource> relationshipData, Set<String> permittedIds) {
        return filterDataUsingIds(relationshipData, permittedIds, true);
    }

    private Data<Resource> dataByExcludingIds(Data<Resource> relationshipData, Set<String> restrictedIds) {
        return filterDataUsingIds(relationshipData, restrictedIds, false);
    }

    private Data<Resource> filterDataUsingIds(Data<Resource> relationshipData,
                                              Set<String> filterIds,
                                              boolean shouldIncludeIds) {
        if (relationshipData == null) {
            return null;
        } else if (relationshipData.isToOne()) {
            Resource contents = relationshipData.get().iterator().next();

            if (shouldIncludeIds && !filterIds.contains(contents.getId())) {
                contents = null;
            } else if (!shouldIncludeIds && filterIds.contains(contents.getId())) {
                contents = null;
            }

            return new Data<>(contents);
        } else {
            Collection<Resource> contents = relationshipData.get();
            List<Resource> filteredContents = new ArrayList<>();

            for (Resource resource : contents) {
                if (shouldIncludeIds && filterIds.contains(resource.getId())) {
                    filteredContents.add(resource);
                } else if (!shouldIncludeIds && !filterIds.contains(resource.getId())) {
                    filteredContents.add(resource);
                }
            }

            return new Data<>(filteredContents);
        }
    }

    private void validateEntityDeletePermissions(Entity entity) {
        if (entity.canBeAccessedByUserForPermission(userProfile, Permission.DELETE)) {
            validateEntityCanBeDeleted(entity);
        } else {
            validateEntityCannotBeDeleted(entity);
        }
    }

    private void validateEntityCanBeDeleted(Entity entity) {
        validationPlan.addValidation(() -> new EntityDeleteabilityValidation(
                entity,
                userProfile,
                HttpStatusCode.NO_CONTENT
        ));
    }

    private void validateEntityCannotBeDeleted(Entity entity) {
        validationPlan.addValidation(() -> new EntityDeleteabilityValidation(
                entity,
                userProfile,
                getFailureCodeForEntity(entity)
        ));
    }

    private void validateEntityNotVisible(Entity entity) {
        validationPlan.addValidation(() -> new EntityVisiblityValidation(
                entity,
                userProfile,
                HttpStatusCode.NOT_FOUND
        ));
    }

    @Override
    public void visitEntityCollection(EntityCollection collection) {
        String invalidId = getInvalidIdFor(collection);

        if (collection.canBeAccessedByUserForPermission(userProfile, Permission.READ)) {
            validateCollectionContentsVisible(collection);
            validateCollectionEntriesVisible(collection, invalidId);
            validateCollectionEntriesCreateable(collection);
        } else {
            validateCollectionContentsNotVisible(collection);
        }
    }

    // TODO - figure out what the largest valid id is per entity type and return that instead
    private String getInvalidIdFor(EntityCollection collection) {
        Set<String> accessibleIds = collection.getCollectionIds();
        int potentialId = 1000000000; // 1,000,000,000 hard to beat a billion
        int largestCollectionId = 0;

        if (accessibleIds.size() > 0) {
            largestCollectionId = Integer.parseInt(Collections.max(accessibleIds)) + 1;
        }

        return Integer.toString(Integer.max(potentialId, largestCollectionId));
    }

    private void validateCollectionContentsVisible(EntityCollection collection) {
        Set<String> idsInCollection = collection.getCollectionIds();
        Set<String> authorizedEntites = getAuthorizedEntitiesForPermission(
                collection.getCollectionEntityType(),
                Permission.READ
        );

        validationPlan.addValidation(() -> new CollectionContentsValidation(
                collection,
                userProfile,
                HttpStatusCode.OK,
                Sets.intersection(idsInCollection, authorizedEntites)
        ));
    }

    private void validateCollectionContentsNotVisible(EntityCollection collection) {
        validationPlan.addValidation(() -> new CollectionContentsValidation(
                collection,
                userProfile,
                HttpStatusCode.FORBIDDEN,
                null
        ));
    }

    private void validateCollectionEntriesVisible(EntityCollection collection, String invalidId) {
        generateCollectionValidationsBasedOnEntity(
                collection,
                invalidId,
                Permission.READ,
                this::collectionEntryVisible,
                this::collectionEntryHidden
        );
    }

    private Validation collectionEntryVisible(Entity entity) {
        return new EntityVisiblityValidation(
                entity,
                userProfile,
                HttpStatusCode.OK
        );
    }

    private Validation collectionEntryHidden(Entity entity) {
        return new EntityVisiblityValidation(
                entity,
                userProfile,
                getFailureCodeForEntity(entity)
        );
    }

    private void validateCollectionEntriesCreateable(EntityCollection collection) {
        generateCollectionValidationsBasedOnEntity(
                collection,
                null,
                Permission.CREATE,
                this::validateEntryCreateable,
                this::validateEntryNotCreateable
        );
    }

    private Validation validateEntryCreateable(Entity entity) {
        if (entity.getResource() == null) {
            log.debug("{} {} has no seralized form", entity, entity.getLineageNodes());
            return null;
        }
        return new CollectionEntryCreatableValidation(
                entity,
                userProfile,
                HttpStatusCode.CREATED
        );
    }

    private Validation validateEntryNotCreateable(Entity entity) {
        if (entity.getResource() == null) {
            log.debug("{} {} has no seralized form", entity, entity.getLineageNodes());
            return null;
        }
        return new CollectionEntryCreatableValidation(
                entity,
                userProfile,
                getFailureCodeForEntity(entity)
        );
    }

    private void generateCollectionValidationsBasedOnEntity(EntityCollection collection,
                                                            String invalidId,
                                                            Permission permission,
                                                            Function<Entity, Validation> createValidationThatSucceeds,
                                                            Function<Entity, Validation> createValidationThatFails) {
        Set<String> idsInCollection = collection.getCollectionIds();
        Set<String> authorizedEntities = getAuthorizedEntitiesForPermission(
                collection.getCollectionEntityType(),
                permission
        );
        Set<String> availableEntities = Sets.intersection(idsInCollection, authorizedEntities);
        Set<String> unauthorizedEntities = Sets.difference(idsInCollection, authorizedEntities);

        for (String id : availableEntities) {
            Entity entity = collection.get(id);
            validationPlan.addValidation(() -> createValidationThatSucceeds.apply(entity));
        }

        for (String id : unauthorizedEntities) {
            Entity entity = collection.get(id);
            validationPlan.addValidation(() -> createValidationThatFails.apply(entity));
        }

        if (invalidId != null) {
            Entity invalidEntity = collection.getInvalidEntity(invalidId);
            validationPlan.addValidation(() -> createValidationThatFails.apply(invalidEntity));
        }
    }

    private Set<String> getAuthorizedEntitiesForPermission(String entityName, Permission permission) {
        return new HashSet<>(userProfile.getIdListForPermission(entityName, permission));
    }

    private HttpStatusCode getFailureCodeForEntity(Entity entity) {
        String id = entity.getId();
        if (userProfile.getIdListForPermission(entity.getEntityType(), Permission.READ)
                       .contains(id) || entity.getLineageNodes().size() == 1) {
            return HttpStatusCode.FORBIDDEN;
        } else {
            return HttpStatusCode.NOT_FOUND;
        }
    }

    /**
     * Generates validations for the entire graph.
     * Validations:
     * - HiddenRootCollectionValidation
     */
    @Override
    public void visitEntityGraph(EntityGraph entityGraph) {
    }
}
