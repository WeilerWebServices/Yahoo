/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core;

import com.google.common.collect.Sets;
import com.yahoo.elide.Elide;
import com.yahoo.elide.IdListLexer;
import com.yahoo.elide.IdListParser;
import com.yahoo.elide.RestrictedFieldsLexer;
import com.yahoo.elide.RestrictedFieldsParser;
import com.yahoo.elide.audit.AuditLogger;
import com.yahoo.elide.core.DataStore;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.security.User;
import com.yahoo.elide.testing.framework.core.configuration.EntityConfiguration;
import com.yahoo.elide.testing.framework.core.configuration.ExposedEntity;
import com.yahoo.elide.testing.framework.core.configuration.PermissionsRow;
import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.configuration.UserScopedEntityDirectory;
import com.yahoo.elide.testing.framework.core.elide.override.NoGeneratedIdsEntityDictionary;
import com.yahoo.elide.testing.framework.core.elide.override.ReadOnlyDataStore;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityDirectory;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateEntityDirectoryVisitor;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateEntityGraphVisitor;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateValidationPlanVisitor;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;
import com.yahoo.elide.testing.framework.core.visitors.IdList.ExpandIdListVisitor;
import com.yahoo.elide.testing.framework.core.visitors.RestrictedFields.RestrictedFieldVisitor;
import com.yahoo.elide.testing.framework.cucumber.CucumberParser;
import com.yahoo.elide.testing.framework.cucumber.StepDefinitions;
import com.yahoo.elide.testing.framework.enums.Permission;
import com.yahoo.elide.testing.framework.validations.ValidationResult;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.BailErrorStrategy;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;
import org.antlr.v4.runtime.misc.ParseCancellationException;
import org.antlr.v4.runtime.tree.ParseTree;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * The primary entry point to the testing library.
 */
@Slf4j
public class ValidationDriver {
    private static final String STEP_DEFINITION_LOCATION = "com/yahoo/elide/testing/framework/cucumber/";

    @Getter
    private SortedMap<UserProfile, Supplier<ValidationPlan>> userValidationPlans = new TreeMap<>();
    @Getter
    private StepDefinitions stepDefinitions;
    @Getter
    private List<UserProfile> profiles;
    private EntityDictionary entityDictionary;
    private EntityDirectory allEntityDirectory;

    public ValidationDriver(String featureFile,
                            UserFactory customUserFactory,
                            DataStore dataStore,
                            AuditLogger logger) throws IOException {
        this(featureFile, customUserFactory, dataStore, logger, false);
    }

    public ValidationDriver(String featureFile,
                            UserFactory customUserFactory,
                            DataStore dataStore,
                            AuditLogger logger,
                            boolean failOnMissingTests) throws IOException {
        stepDefinitions = parseConfigWithCucumber(featureFile);
        SortedSet<EntityCollection> rootCollections = getRootCollectionsFor(stepDefinitions);

        entityDictionary = new NoGeneratedIdsEntityDictionary();
        ReadOnlyDataStore readOnlyDataStore = new ReadOnlyDataStore(dataStore);
        readOnlyDataStore.populateEntityDictionary(entityDictionary);

        Elide graphElide = new Elide(logger, readOnlyDataStore, entityDictionary);
        log.info("Exploring test data");
        EntityGraph graph = new EntityGraph(rootCollections);
        graph.accept(new GenerateEntityGraphVisitor(graphElide, entityDictionary), null);

        allEntityDirectory = new GenerateEntityDirectoryVisitor();

        graph.accept((Visitor) allEntityDirectory, null);
        warnForMissingTests(failOnMissingTests);

        profiles = createUserProfiles(stepDefinitions, customUserFactory);
        profiles.forEach(userProfile -> {
            userValidationPlans.put(userProfile, () -> {
                Elide elide = new Elide(logger, readOnlyDataStore, entityDictionary);
                ValidationPlan plan = new ValidationPlan(elide, stepDefinitions.getDisabledValidations());

                GenerateValidationPlanVisitor visitor = new GenerateValidationPlanVisitor(plan, userProfile);
                graph.accept(visitor, userProfile);

                return visitor.getValidationPlan();
            });
        });
    }

    private StepDefinitions parseConfigWithCucumber(String featureFile) throws IOException {
        if (CucumberParser.class.getClassLoader().getResource(featureFile) == null) {
            throw new IOException("Feature file not found");
        }
        String absolutePathFeatureFile = CucumberParser.class.getClassLoader().getResource(featureFile).getPath();
        CucumberParser cucumberParser = new CucumberParser(absolutePathFeatureFile, STEP_DEFINITION_LOCATION);

        return CucumberParser.stepDefinitions;
    }

    private SortedSet<EntityCollection> getRootCollectionsFor(StepDefinitions stepDefinitions) {
        SortedSet<EntityCollection> rootCollections = new TreeSet<>();

        List<ExposedEntity> exposedEntityList = stepDefinitions.getExposedEntityList();
        for (ExposedEntity exposedEntity : exposedEntityList) {
            if (exposedEntity.isRootable()) {
                rootCollections.add(new EntityCollection(null, exposedEntity.getEntityName(), true));
            }
        }

        rootCollections.addAll(
                exposedEntityList.stream()
                                 .filter(ExposedEntity::isRootable)
                                 .map(exposedEntity -> new EntityCollection(
                                         null,
                                         exposedEntity.getEntityName(),
                                         true
                                 ))
                                 .collect(Collectors.toList())
        );

        return rootCollections;
    }

    private List<UserProfile> createUserProfiles(StepDefinitions configuration, UserFactory customUserFactory) {
        List<UserProfile> createdUserProfiles = new ArrayList<>();
        List<String> usersList = configuration.getUsersList();
        List<PermissionsRow> allRows = configuration.getAssociatedPermissionsRowList();

        for (String userAlias : usersList) {

            List<PermissionsRow> userRows = allRows
                    .stream()
                    .filter(row -> row.getUserName().equals(userAlias))
                    .collect(Collectors.toList());


            User user = customUserFactory.makeUser(userAlias);
            Map<String, EntityConfiguration> entityRestrictionsMap = getEntityRestrictionsForUser(userAlias, userRows);
            UserProfile userProfile = new UserProfile(user, entityRestrictionsMap);
            createdUserProfiles.add(userProfile);
        }
        return createdUserProfiles;
    }

    private Map<String, EntityConfiguration> getEntityRestrictionsForUser(String userAlias,
                                                                          List<PermissionsRow> permissionsRows) {
        Map<String, EntityConfiguration> entityConfigurations = new HashMap<>();

        UserScopedEntityDirectory allowedEntityDirectory = new UserScopedEntityDirectory(
                allEntityDirectory,
                entityDictionary,
                permissionsRows
        );

        permissionsRows.stream()
                       .filter(row -> row.getUserName().equals(userAlias))
                       .forEach(row -> {
                                   String entityName = row.getEntityName();
                                   EntityConfiguration configuration = getConfigurationForEntity(
                                           row,
                                           allowedEntityDirectory
                                   );

                                    updateConfigurationsWithConfiguration(
                                            entityConfigurations,
                                            entityName,
                                            configuration
                                    );
                                }
                       );

        return entityConfigurations;
    }


    private EntityConfiguration getConfigurationForEntity(PermissionsRow row,
                                                          UserScopedEntityDirectory entityDirectory) {
        String name = row.getEntityName();

        ExpandIdListVisitor expandIdListVisitor = new ExpandIdListVisitor(
                entityDictionary,
                name,
                entityDirectory,
                allEntityDirectory
        );
        ParseTree tree = ValidationDriver.parseIdListExpression(row.getValidIdsExpression());
        Set<String> expandedIds = expandIdListVisitor.visit(tree);

        Map<Permission, List<String>> permissionIdMap = new HashMap<>();
        for (Permission permission : row.getEntityPermissions()) {
            permissionIdMap.put(permission, new ArrayList<>(expandedIds));
        }

        Map<String, Set<String>> readRestrictedFields = new HashMap<>();
        Map<String, Set<String>> writeRestrictedFields = new HashMap<>();
        for (String id : expandedIds) {
            RestrictedFieldVisitor visitor = new RestrictedFieldVisitor(entityDictionary, row.getEntityName());

            Set<String> fields = visitor.visit(parseRestrictedFieldExpression(row.getReadRestrictedFields()));
            readRestrictedFields.put(id, fields);

            visitor = new RestrictedFieldVisitor(entityDictionary, row.getEntityName());

            writeRestrictedFields.put(id,
                    Sets.union(
                            fields,
                            visitor.visit(parseRestrictedFieldExpression(row.getWriteRestrictedFields()))
                    )
            );
        }

        return new EntityConfiguration(name,
                permissionIdMap,
                readRestrictedFields,
                writeRestrictedFields
        );
    }

    private static void updateConfigurationsWithConfiguration(Map<String, EntityConfiguration> entityConfigurations,
                                                              String entityName,
                                                              EntityConfiguration configuration) {
        if (entityConfigurations.containsKey(entityName)) {
            entityConfigurations.get(entityName).mergeWithConfiguration(configuration);
        } else {
            entityConfigurations.put(entityName, configuration);
        }
    }

    public Map<UserProfile, List<ValidationResult>> execute() {
        SortedMap<UserProfile, List<ValidationResult>> testResults = new TreeMap<>();

        userValidationPlans.entrySet().forEach(entry -> {
            UserProfile profile = entry.getKey();

            log.info("Generating validation plan for {}", profile);

            ValidationPlan plan = entry.getValue().get();

            log.info("Executing {} validations for {}", String.format("%,d", plan.size()), profile);
            testResults.put(profile, plan.executeParallel());
        });

        return testResults;
    }

    private void warnForMissingTests(boolean failOnMissingTests) {
        List<ExposedEntity> exposedEntities = stepDefinitions.getExposedEntityList();
        Set<String> entityTestsMissed = new HashSet<>();
        for (ExposedEntity entity: exposedEntities) {
            String type = entity.getEntityName();
            if (allEntityDirectory.getAllEntitiesOfType(type).size() == 0) {
                entityTestsMissed.add(type);
                log.warn("No tests will run for entity: {}", type);
            }
        }

        if (failOnMissingTests && entityTestsMissed.size() > 0) {
            throw new IllegalStateException("Some entities are exposed but missing test data!");
        }
    }

    public static ParseTree parseIdListExpression(String expression) {
        ANTLRInputStream is = new ANTLRInputStream(expression);
        IdListLexer lexer = new IdListLexer(is);
        lexer.addErrorListener(new BaseErrorListener() {
            @Override
            public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, int line,
                                    int charPositionInLine, String msg, RecognitionException e) {
                log.debug("Syntax Error on line {} character {}: {}", line, charPositionInLine, msg);
                throw new ParseCancellationException(msg, e);
            }
        });

        IdListParser parser = new IdListParser(new CommonTokenStream(lexer));
        parser.setErrorHandler(new BailErrorStrategy());
        return parser.start();
    }

    public static ParseTree parseRestrictedFieldExpression(String fieldExpression) {
        ANTLRInputStream is = new ANTLRInputStream(fieldExpression);
        RestrictedFieldsLexer lexer = new RestrictedFieldsLexer(is);
        lexer.addErrorListener(new BaseErrorListener() {
            @Override
            public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, int line,
                                    int charPositionInLine, String msg, RecognitionException e) {
                log.debug("Syntax Error on line {} character {}: {}", line, charPositionInLine, msg);
                throw new ParseCancellationException(msg, e);
            }
        });

        RestrictedFieldsParser parser = new RestrictedFieldsParser(new CommonTokenStream(lexer));
        parser.setErrorHandler(new BailErrorStrategy());
        return parser.start();
    }
}
