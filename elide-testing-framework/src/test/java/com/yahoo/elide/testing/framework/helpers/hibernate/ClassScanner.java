/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.helpers.hibernate;

import org.glassfish.jersey.server.internal.scanning.AnnotationAcceptingListener;
import org.glassfish.jersey.server.internal.scanning.PackageNamesScanner;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scans a package for classes by looking at files in the classpath.
 */
public class ClassScanner {
    /**
     * Scans all classes accessible from the context class loader which belong to the given package and subpackages.
     *
     * @return The classes
     */
    static public List<Class<?>> getAnnotatedClasses(Package pckg, Class<? extends Annotation> annotation) {

        final AnnotationAcceptingListener annotationAcceptingListener = new AnnotationAcceptingListener(annotation);
        final PackageNamesScanner packageNamesScanner = new PackageNamesScanner(new String[]{pckg.getName()}, true);

        while (packageNamesScanner.hasNext()) {
            final String next = packageNamesScanner.next();
            if (annotationAcceptingListener.accept(next)) {
                try (final InputStream in = packageNamesScanner.open()) {
                    annotationAcceptingListener.process(next, in);
                } catch (IOException e) {
                    throw new RuntimeException("AnnotationAcceptingListener failed to process scanned resource: "
                            + next);
                }
            }
        }

        return annotationAcceptingListener.getAnnotatedClasses()
                                          .stream()
                                          .collect(Collectors.toCollection(ArrayList::new));
    }
}
