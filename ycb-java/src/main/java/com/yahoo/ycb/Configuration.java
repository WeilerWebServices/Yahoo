/*
 * Copyright 2015 Yahoo inc.
 * Licensed under the terms of the BSD License. Please see LICENSE file in the project home directory for terms.
 */

package com.yahoo.ycb;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.google.common.collect.ImmutableMap;
import com.googlecode.concurrentlinkedhashmap.ConcurrentLinkedHashMap;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

/**
 * The main API class.
 * <p>
 * In most common applications, configuration is created from a Loader once, and then one or more times
 * a projection is generated from a context for use.
 */
public class Configuration {

    private static final int PROJECTION_CACHE_CAPACITY = 100;
    private static final int VALUE_CACHE_CAPACITY = 100;
    private String pathSeparator = "\\.";

    private final LookupTree tree;

    // Cache from context string to value cache
    private final ConcurrentMap<String, ConcurrentMap<String, JsonNode>> projectionCache = new ConcurrentLinkedHashMap.Builder<String, ConcurrentMap<String, JsonNode>>()
            .maximumWeightedCapacity(PROJECTION_CACHE_CAPACITY)
            .build();

    private final Map<String, String> fixedContext;

    private final ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

    private Configuration(LookupTree tree, Map<String, String> fixedContext) {
        this.tree = tree;
        this.fixedContext = ImmutableMap.copyOf(fixedContext);
    }

    /**
     * Perform some validations in the configuration
     *
     * @return A List of errors in the configuration, empty list for no errors
     */
    public List<ValidationError> validate() {
        return tree.validate();
    }

    /**
     * Construct the configuration given a Loader.
     *
     * @param loader The loader is responsible for providing the raw configuration values from somewhere
     * @return The Configuration instance
     * @throws IOException Throws from loader methods
     */
    public static Configuration load(Loader loader) throws IOException {
        return load(loader, Collections.emptyMap());
    }

    /**
     * Construct the configuration given a Loader and a fixed context
     *
     * @param loader       The loader is responsible for providing the raw configuration values from somewhere
     * @param fixedContext fixed context, i.e. specify a subset of context that all projections will adhere.
     * @return The Configuration instance
     * @throws IOException Throws from loader methods
     */
    public static Configuration load(Loader loader, Map<String, String> fixedContext) throws IOException {
        return new Configuration(LookupTree.create(loader, fixedContext), fixedContext);
    }

    /**
     * Get the projection of the configuration given a context.
     *
     * @param context A map from dimension name to value, omitted dimensions are implicitly "any"
     * @param allowSystemPropertyOverride if true, properties in System Properties take priority if defined
     * @return The projected configuration from the context
     */
    public Projection project(Map<String, String> context, boolean allowSystemPropertyOverride) {
        return new Projection(context, allowSystemPropertyOverride);
    }

    /**
     * Get the projection of the configuration given a context. Does not allow System properties override.
     *
     * @param context A map from dimension name to value, omitted dimensions are implicitly "any"
     * @return The projected configuration from the context
     */
    public Projection project(Map<String, String> context) {
        return project(context, false);
    }

    /**
     * Enumerate all possible contexts from the provided dimensions.
     *
     * @param dimensions The list of dimensions to generate the possible contexts
     * @return A list of all valid combination of contexts from the given dimensions
     */
    public List<Map<String, String>> traverseContexts(List<Dimension> dimensions) {
        final List<Map<String, String>> contexts = new ArrayList<>();

        if (!dimensions.isEmpty()) {
            final Dimension dimension = dimensions.get(0);
            final List<Dimension> rest = dimensions.subList(1, dimensions.size());

            for (final String value : dimension.traverse()) {
                traverseContexts(rest).forEach(context -> {
                    Map<String, String> newContext = new HashMap<>();
                    newContext.putAll(context);
                    newContext.put(dimension.getName(), value);

                    contexts.add(newContext);
                });
            }
        } else {
            contexts.add(Collections.emptyMap());
        }

        return contexts;
    }

    private static String contextToString(final Map<String, String> context) {
        return context.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .sorted()
                .collect(Collectors.joining("&"));
    }

    /**
     * @return The regular expression used to separate projection lookup paths
     */
    public String getPathSeparator() {
        return pathSeparator;
    }

    /**
     * @param pathSeparator Regular expression used to separate projection lookup paths
     */
    public void setPathSeparator(String pathSeparator) {
        this.pathSeparator = pathSeparator;
    }

    /**
     * A Projection is a view from the configuration, after a context is applied.
     */
    public class Projection {

        private ConcurrentMap<String, JsonNode> valueCache;

        private final Map<String, String> context;
        private final boolean allowSystemPropertyOverride;

        /**
         * Create a new projection of the configuration
         *
         * @param context the configuration context
         * @param allowSystemPropertyOverride Whether the System properties take priority
         */
        private Projection(Map<String, String> context, boolean allowSystemPropertyOverride) {
            this.context = context;
            this.allowSystemPropertyOverride = allowSystemPropertyOverride;

            final String key = contextToString(context);
            valueCache = projectionCache.get(key);
            if (valueCache == null) {
                valueCache = new ConcurrentLinkedHashMap.Builder<String, JsonNode>()
                        .maximumWeightedCapacity(VALUE_CACHE_CAPACITY)
                        .build();
                projectionCache.put(key, valueCache);
            }
        }

        public JsonNode getJson(String path) {
            if (allowSystemPropertyOverride) {
                String prop = System.getProperty(path);
                if (prop != null) {
                    // parse property to JSON using YAML parsing
                    try {
                        return mapper.readTree(prop);
                    } catch (IOException e) {
                        // DO nothing... continue to load from config
                    }
                }
            }

            JsonNode value = valueCache.get(path);
            if (value == null) {
                value = tree.project(context, path.split(pathSeparator));
                valueCache.put(path, value);
            }
            return value;
        }

        public Map<String, String> getContext() {
            return new ImmutableMap.Builder<String, String>().putAll(fixedContext).putAll(context).build();
        }

        public String getText(String path) {
            return getText(path, "");
        }

        public boolean getBoolean(String path) {
            return getBoolean(path, false);
        }

        public int getInteger(String path) {
            return getInteger(path, 0);
        }

        public long getLong(String path) {
            return getLong(path, 0);
        }

        public double getDouble(String path) {
            return getDouble(path, 0);
        }

        public String getText(String path, String defaultValue) {
            return getJson(path).asText(defaultValue);
        }

        public boolean getBoolean(String path, boolean defaultValue) {
            return getJson(path).asBoolean(defaultValue);
        }

        public int getInteger(String path, int defaultValue) {
            return getJson(path).asInt(defaultValue);
        }

        public long getLong(String path, long defaultValue) {
            return getJson(path).asLong(defaultValue);
        }

        public double getDouble(String path, double defaultValue) {
            return getJson(path).asDouble(defaultValue);
        }

        public <T> T getObject(String path, Class<T> valueType) throws JsonProcessingException {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.treeToValue(getJson(path), valueType);
        }

        public <T> List<T> getList(String path) {
            try {
                return getObject(path, List.class);
            } catch (JsonProcessingException e) {
                return null;
            }
        }
    }
}
