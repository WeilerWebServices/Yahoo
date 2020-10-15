/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.elide.override;

import javax.persistence.GeneratedValue;
import java.lang.annotation.Annotation;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * The instance of Elide we use for testing must ignore @GeneratedValue for the entities it tracks.
 * Using the @GeneratedValue annotation makes Elide ignore the id that users pass to a create, which
 * causes our create entity tests to fail because Elide returns entities with different IDs than we specify.
 */
public class NoGeneratedIdsEntityDictionary extends com.yahoo.elide.core.EntityDictionary {

    @Override
    public Collection<Annotation> getIdAnnotations(Object value) {
        Collection<Annotation> annotations = super.getIdAnnotations(value);

        List<Annotation> filteredAnnotations = new ArrayList<>();
        for (Annotation annotation : annotations) {
            if (annotation instanceof GeneratedValue) {
                continue;
            }
            filteredAnnotations.add(annotation);
        }

        return filteredAnnotations;
    }
}
