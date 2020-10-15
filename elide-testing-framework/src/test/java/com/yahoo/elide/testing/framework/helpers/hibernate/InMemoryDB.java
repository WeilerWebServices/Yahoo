/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers.hibernate;

import com.yahoo.elide.core.DataStore;
import com.yahoo.elide.core.DataStoreTransaction;
import com.yahoo.elide.core.EntityDictionary;
import com.yahoo.elide.testing.framework.example.beans.Parent;
import com.yahoo.elide.testing.framework.helpers.datastore.CloningTank;
import com.yahoo.elide.testing.framework.core.elide.override.ReadOnlyDataStore;
import com.yahoo.elide.utils.coerce.CoerceUtil;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.hibernate.MappingException;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.IOException;
import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simple non-persistent in-memory database.
 */
public class InMemoryDB implements DataStore, ReadOnlyDataStore.ObjectCloner {
    private static final ConcurrentHashMap<Class<?>, ConcurrentHashMap<String, Object>> DATABASE =
            new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<Class<?>, AtomicLong> NEXT_ID_BY_TYPE = new ConcurrentHashMap<>();
    private static final CloningTank CLONER = new CloningTank();

    @Getter private EntityDictionary dictionary;

    /**
     * Simple transaction for the in-memory database.
     */
    public static class InMemoryTransaction implements DataStoreTransaction {
        private List<Operation> operations;
        private EntityDictionary dictionary;

        public InMemoryTransaction(EntityDictionary dictionary) {
            this.dictionary = dictionary;
            this.operations = new ArrayList<>();
        }

        @Override
        public void flush() {
            // Do nothing
        }

        @Override
        public void save(Object object) {
            if (object == null) {
                return;
            }
            String id = dictionary.getId(object);
            if (id.equals("0")) {
                setId(object, dictionary.getId(createObject(object.getClass())));
            }
            id = dictionary.getId(object);
            operations.add(new Operation(id, object, object.getClass(), false));
        }

        @Override
        public void delete(Object object) {
            if (object == null) {
                return;
            }
            String id = dictionary.getId(object);
            operations.add(new Operation(id, object, object.getClass(), true));
        }

        @Override
        public void commit() {
            operations.forEach(op -> {
                Class<?> cls = op.getType();
                ConcurrentHashMap<String, Object> data = DATABASE.get(cls);
                Object instance = op.getInstance();
                if (instance == null) {
                    return;
                }
                String id = op.getId();
                if (op.isDelete()) {
                    if (data != null) {
                        data.remove(id);
                    }
                } else {
                    if (data == null) {
                        data = new ConcurrentHashMap<>();
                        DATABASE.put(cls, data);
                    }
                    data.put(id, instance);
                }
            });
            operations.clear();
        }

        @Override
        public <T> T createObject(Class<T> entityClass) {
            if (DATABASE.get(entityClass) == null) {
                DATABASE.put(entityClass, new ConcurrentHashMap<>());
                NEXT_ID_BY_TYPE.put(entityClass, new AtomicLong(1));
            }
            AtomicLong idValue = NEXT_ID_BY_TYPE.get(entityClass);
            String id = String.valueOf(idValue.getAndIncrement());
            try {
                T instance = entityClass.newInstance();
                setId(instance, id);
                return instance;
            } catch (InstantiationException | IllegalAccessException e) {
                e.printStackTrace();
            }
            return null;
        }

        public void setId(Object value, String id) {
            for (Class<?> cls = value.getClass(); cls != null; cls = cls.getSuperclass()) {
                for (Method method : cls.getMethods()) {
                    if (method.isAnnotationPresent(Id.class)) {
                        if (method.getName().startsWith("get")) {
                            String setName = "set" + method.getName().substring(3);
                            for (Method setMethod : cls.getMethods()) {
                                if (setMethod.getName().equals(setName) && setMethod.getParameterCount() == 1) {
                                    try {
                                        setMethod.invoke(value, coerce(id, setMethod.getParameters()[0].getType()));
                                    } catch (ReflectiveOperationException e) {
                                        e.printStackTrace();
                                    }
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }

        private Object coerce(Object value, Class<?> fieldClass) {
            return CoerceUtil.coerce(value, fieldClass);
        }

        @Override
        public <T> T loadObject(Class<T> loadClass, Serializable id) {
            ConcurrentHashMap<String, T> objs = (ConcurrentHashMap<String, T>) DATABASE.get(loadClass);
            if (objs == null) {
                return null;
            }
            return objs.get(id.toString());
        }

        @Override
        public <T> List<T> loadObjects(Class<T> loadClass) {
            ConcurrentHashMap<String, T> objs = (ConcurrentHashMap<String, T>) DATABASE.get(loadClass);
            if (objs == null) {
                return null;
            }
            List<T> results = new ArrayList<>();
            objs.forEachValue(1, results::add);
            return results;
        }

        @Override
        public void close() throws IOException {
            operations.clear();
        }

        @AllArgsConstructor
        private static class Operation {
            @Getter private final String id;
            @Getter private final Object instance;
            @Getter private final Class<?> type;
            @Getter private final boolean delete;
        }
    }

    /* CHECKSTYLE:OFF EmptyCatchBlock */
    @Override
    public void populateEntityDictionary(EntityDictionary dictionary) {
        try {
            ClassScanner.getAnnotatedClasses(Parent.class.getPackage(), Entity.class)
                        .forEach(dictionary::bindEntity);
        } catch (MappingException e) { }
        this.dictionary = dictionary;
    }
    /* CHECKSTYLE:ON EmptyCatchBlock */

    @Override
    public DataStoreTransaction beginTransaction() {
        return new InMemoryTransaction(dictionary);
    }

    @Override
    public <T> T deepClone(T object) {
        return CLONER.deepClone(object);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Database contents ");
        for (Class<?> cls : DATABASE.keySet()) {
            sb.append("\n Table ").append(cls).append(" contents \n");
            ConcurrentHashMap<String, Object> data = DATABASE.get(cls);
            for (String id : data.keySet()) {
                sb.append(" Id: ").append(id).append(" Value: ").append(data.get(id));
            }
        }
        return sb.toString();
    }
}
