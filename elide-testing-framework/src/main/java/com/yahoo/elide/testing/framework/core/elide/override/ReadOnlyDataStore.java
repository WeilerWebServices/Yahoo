/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.elide.override;

import com.yahoo.elide.core.DataStore;
import com.yahoo.elide.core.DataStoreTransaction;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.core.FilterScope;
import com.yahoo.elide.security.User;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.Serializable;

/**
 * We need this datastore so that as we run the validations in the test framework the
 * entities are not modified which ensures that no validation can effect any other validation.
 */
@Slf4j
public class ReadOnlyDataStore implements DataStore {

    /**
     * Interface for cloning an object.
     */
    public interface ObjectCloner {
        <T> T deepClone(T object);
    }

    @Getter final DataStore dataStore;
    public ReadOnlyDataStore(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @Override
    public void populateEntityDictionary(EntityDictionary dictionary) {
        dataStore.populateEntityDictionary(dictionary);
    }

    @Override
    public DataStoreTransaction beginTransaction() {
        return new ReadOnlyDataStoreTransaction(dataStore.beginTransaction());
    }

    /**
     * A datastore transaction that changes nothing.
     */
    public class ReadOnlyDataStoreTransaction implements DataStoreTransaction {

        public final DataStoreTransaction dataStoreTransaction;
        public ReadOnlyDataStoreTransaction(DataStoreTransaction dataStoreTransaction) {
            this.dataStoreTransaction = dataStoreTransaction;
        }

        @Override
        public User accessUser(Object opaqueUser) {
            return dataStoreTransaction.accessUser(opaqueUser);
        }

        @Override
        public void save(Object entity) { }

        @Override
        public void delete(Object entity) { }

        @Override
        public void commit() { }

        @Override
        public void flush() {
            dataStoreTransaction.flush();
        }

        @Override
        public <T> T createObject(Class<T> entityClass) {
            try {
                return entityClass.newInstance();
            } catch (InstantiationException | IllegalAccessException | IllegalArgumentException e) {
                log.error("ReadOnlyDataStoreTransaction cannot instantiate object: {}\n{}", entityClass, e);
            }
            return null;
        }

        @Override
        public <T> T loadObject(Class<T> entityClass, Serializable id) {
            return makeClone(dataStoreTransaction.loadObject(entityClass, id));
        }

        @Override
        public <T> Iterable<T> loadObjects(Class<T> entityClass) {
            return makeClone(dataStoreTransaction.loadObjects(entityClass));
        }

        @Override
        public <T> Iterable<T> loadObjects(Class<T> entityClass, FilterScope filterScope) {
            if (filterScope.getRequestScope().getUser().getOpaqueUser() == null) {
                // BYPASS security mode
                return loadObjects(entityClass);
            }

            return makeClone(dataStoreTransaction.loadObjects(entityClass, filterScope));
        }

        /**
         * Attempt to deepClone if the dataStore supports it.
         * @param val value
         * @return val or a clone of val
         */
        private <T> T makeClone(T val) {
            if (dataStore instanceof ObjectCloner) {
                return ((ObjectCloner) dataStore).deepClone(val);
            }
            return val;
        }

        @Override
        public void close() throws IOException {
            dataStoreTransaction.close();
        }
    }
}
