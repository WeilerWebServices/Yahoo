/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers;

import com.yahoo.elide.Elide;
import com.yahoo.elide.audit.AuditLogger;
import com.yahoo.elide.core.DataStoreTransaction;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.testing.framework.core.UserFactory;
import com.yahoo.elide.testing.framework.core.ValidationDriver;
import com.yahoo.elide.testing.framework.core.elide.override.NoGeneratedIdsEntityDictionary;
import com.yahoo.elide.testing.framework.core.graph.EntityCollection;
import com.yahoo.elide.testing.framework.core.graph.EntityGraph;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.GenerateEntityGraphVisitor;
import com.yahoo.elide.testing.framework.example.beans.Child;
import com.yahoo.elide.testing.framework.example.beans.Human;
import com.yahoo.elide.testing.framework.example.beans.Parent;
import com.yahoo.elide.testing.framework.helpers.hibernate.InMemoryDB;
import com.yahoo.elide.testing.framework.helpers.user.TestUserFactory;
import lombok.Getter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * Setup the test data.
 */
public class SetupTestDataDriver {

    @Getter
    private AuditLogger auditLogger = new AuditLogger() {
        @Override
        public void commit() throws IOException {

        }
    };
    @Getter private InMemoryDB dataStore = new InMemoryDB();
    @Getter private EntityDictionary entityDictionary;
    @Getter private ValidationDriver driver;
    private EntityGraph entityGraph;

    private static volatile SetupTestDataDriver instance = null;
    public static synchronized SetupTestDataDriver getInstance() throws IOException {
        if (instance == null) {
            instance = new SetupTestDataDriver();
        }
        return instance;
    }

    private SetupTestDataDriver() throws IOException {
        setupEntityDictionary();
        setupDB();

        String featureFile = "SampleConfig.feature";

        UserFactory customUserFactory = new TestUserFactory();

        AuditLogger auditLogger = new AuditLogger() {
            @Override
            public void commit() throws IOException {

            }
        };

        driver = new ValidationDriver(featureFile, customUserFactory, dataStore, auditLogger);
    }

    private void setupEntityDictionary() {
        dataStore.populateEntityDictionary(new NoGeneratedIdsEntityDictionary());
        entityDictionary = dataStore.getDictionary();
    }

    private void setupDB() {
        DataStoreTransaction tx = dataStore.beginTransaction();

        Map<String, Human> bonhams = generateBonhamFamily(tx);
        Map<String, Human> amalbertis = generateAmalbertiFamily(tx);
        Map<String, Human> tangs = generateTangFamiliy(tx);

        Parent mo = (Parent) bonhams.get("mo");
        Parent margery = (Parent) bonhams.get("margery");
        Child gavino = (Child) bonhams.get("gavino");
        Child payton = (Child) bonhams.get("payton");

        Parent emmanuel = (Parent) amalbertis.get("emmanuel");
        Child rebekah = (Child) amalbertis.get("rebekah");
        Child dove = (Child) amalbertis.get("dove");

        Parent goran = (Parent) tangs.get("goran");
        Parent hina = (Parent) tangs.get("hina");
        Child lim = (Child) tangs.get("lim");

        // set friends
        gavino.setPlaymates(asSet(payton, rebekah, dove));
        payton.setPlaymates(asSet(gavino, dove));

        rebekah.setPlaymates(new HashSet<>());
        dove.setPlaymates(asSet(gavino, payton, rebekah));

        lim.setPlaymates(new HashSet<>());

        // set other spouses
        margery.setOtherSpouses(asSet(emmanuel));
        emmanuel.setOtherSpouses(asSet(margery));

        // set up family friends
        mo.setFriends(asSet(emmanuel));
        margery.setFriends(asSet(emmanuel));

        emmanuel.setFriends(asSet(mo, margery, goran, hina));

        goran.setFriends(asSet(emmanuel));
        hina.setFriends(asSet(emmanuel));

        // save everyone's relationships
        saveFamiliy(tx, bonhams);
        saveFamiliy(tx, amalbertis);
        saveFamiliy(tx, tangs);

        tx.commit();
    }

    @SafeVarargs
    private final <T extends Human> HashSet<T> asSet(T... people) {
        return new HashSet<>(Arrays.asList(people));
    }

    /*
     * Parents:
     *  Mo Bonham
     *  Margery Bonham
     * Children:
     *  Gavino Bonham
     *  Payton Bohnam
     *  Oengus Bonham
     */
    private Map<String, Human> generateBonhamFamily(DataStoreTransaction tx) {
        Map<String, Human> family = new HashMap<>();
        String surname = TestUserFactory.BONHAM;

        Parent mo = new Parent();
        mo.setFirstName("Mo");
        mo.setLastName(surname);
        mo.setAge(35);

        Parent margery = new Parent();
        margery.setFirstName("Margery");
        margery.setLastName(surname);
        margery.setAge(32);

        mo.setSpouse(margery);
        margery.setSpouse(mo);

        family.put("mo", mo);
        family.put("margery", margery);

        Child gavino = new Child();
        gavino.setFirstName("Gavino");
        gavino.setLastName(surname);
        gavino.setAge(6);

        Child payton = new Child();
        payton.setFirstName("Payton");
        payton.setLastName(surname);
        payton.setAge(4);

        family.put("gavino", gavino);
        family.put("payton", payton);

        tx.save(mo);        // P1
        tx.save(margery);   // P2
        tx.save(gavino);    // C1
        tx.save(payton);    // C2

        Set<Parent> parents = asSet(mo, margery);
        gavino.setParents(parents);
        payton.setParents(parents);

        Set<Child> children = asSet(gavino, payton);
        mo.setChildren(children);
        margery.setChildren(children);

        saveFamiliy(tx, family);

        return family;
    }

    private void saveFamiliy(DataStoreTransaction tx, Map<String, Human> family) {
        family.values().forEach(tx::save);
    }

    /*
     * Parents:
     *  Emmanuel Amalberti
     * Children:
     *  Rebekah Amalberti
     *  Dove Amalberti
     *  Alba Amalberti
     */
    private Map<String, Human> generateAmalbertiFamily(DataStoreTransaction tx) {
        Map<String, Human> family = new HashMap<>();
        String surname = TestUserFactory.AMALBERTI;

        Parent emmanuel = new Parent();
        emmanuel.setFirstName("Emmanuel");
        emmanuel.setLastName(surname);
        emmanuel.setAge(40);

        family.put("emmanuel", emmanuel);

        Child rebekah = new Child();
        rebekah.setFirstName("Rebekah");
        rebekah.setLastName(surname);
        rebekah.setAge(12);

        Child dove = new Child();
        dove.setFirstName("Dove");
        dove.setLastName(surname);
        dove.setAge(11);

        family.put("rebekah", rebekah);
        family.put("dove", dove);

        tx.save(emmanuel);  // P3
        tx.save(rebekah);   // C4
        tx.save(dove);      // C5

        Set<Parent> parents = asSet(emmanuel);
        rebekah.setParents(parents);
        dove.setParents(parents);

        Set<Child> children = asSet(rebekah, dove);
        emmanuel.setChildren(children);

        saveFamiliy(tx, family);

        return family;
    }

    /*
     * Parents:
     *  Goran Tang
     *  Hina Tang
     * Children:
     *  Lim Tang
     */
    private Map<String, Human> generateTangFamiliy(DataStoreTransaction tx) {
        Map<String, Human> family = new HashMap<>();
        String surname = TestUserFactory.TANG;

        Parent goran = new Parent();
        goran.setFirstName("Goran");
        goran.setLastName(surname);
        goran.setAge(55);

        Parent hina = new Parent();
        hina.setFirstName("Hina");
        hina.setLastName(surname);
        hina.setAge(55);

        goran.setSpouse(hina);
        hina.setSpouse(goran);

        family.put("goran", goran);
        family.put("hina", hina);

        Child lim = new Child();
        lim.setFirstName("Lim");
        lim.setLastName(surname);
        lim.setAge(22);

        family.put("lim", lim);

        tx.save(goran);     // P4
        tx.save(hina);      // P5
        tx.save(lim);       // C6

        Set<Parent> parents = asSet(goran, hina);
        lim.setParents(parents);

        Set<Child> children = asSet(lim);
        goran.setChildren(children);
        hina.setChildren(children);

        saveFamiliy(tx, family);

        return family;
    }

    public EntityGraph getEntityGraph() {
        if (entityGraph == null) {
            setupEntityGraph();
        }
        return entityGraph;
    }
    private void setupEntityGraph() {
        entityGraph = createEntityGraphWithRootCollections();
        traverseEntityGraph();
    }

    private EntityGraph createEntityGraphWithRootCollections() {
        EntityCollection parents = new EntityCollection(null, "parent", true);
        SortedSet<EntityCollection> rootCollections = new TreeSet<>(Collections.singletonList(parents));
        return new EntityGraph(rootCollections);
    }

    private void traverseEntityGraph() {
        GenerateEntityGraphVisitor entityGraphVisitor = new GenerateEntityGraphVisitor(getElide(), entityDictionary);
        entityGraph.accept(entityGraphVisitor, null);
    }

    public Elide getElide() {
        return new Elide(auditLogger, dataStore, entityDictionary);
    }
}
