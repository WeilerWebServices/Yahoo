/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core;

import com.yahoo.elide.Elide;
import com.yahoo.elide.ElideResponse;
import com.yahoo.elide.testing.framework.validations.Validation;
import com.yahoo.elide.testing.framework.validations.ValidationResult;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;

/**
 * The set of validations generated to verify that a user has the intended level of access to the system.
 */
public class ValidationPlan {

    private final Elide elide;
    private final List<String> disabledValidations;
    private final List<Supplier<Validation>> toExecute = new ArrayList<>();
    private final Set<String> executeIds;

    public ValidationPlan(Elide elide, List<String> disabledValidations) {
        this.elide = elide;
        this.disabledValidations = disabledValidations;
        this.executeIds = getExecuteIds();
    }

    public void addValidation(Supplier<Validation> supplier) {
        toExecute.add(supplier);
    }

    @Override
    public String toString() {
        String str = "Validation Plan Output: \n";
        for (Supplier<Validation> currentValidation : toExecute) {
            str += currentValidation.get().toString() + "\n";
        }
        return str;
    }

    public List<ValidationResult> executeParallel() {
        List<ValidationResult> failedValidationList = Collections.synchronizedList(new ArrayList<>());
        // we want the validation ids to be deterministic, which means that we need to get them
        // from the suppliers before we can parallelize their execution so that they are generated
        // in a deterministic order
        toExecute.parallelStream()
                 .map(Supplier::get)
                 .forEach(validation -> executeValidation(failedValidationList, validation));
        return failedValidationList;
    }

    public List<ValidationResult> execute() {
        List<ValidationResult> failedValidationList = new ArrayList<>();
        toExecute.stream()
                 .map(Supplier::get)
                 .forEach(validation -> executeValidation(failedValidationList, validation));
        return failedValidationList;
    }

    private void executeValidation(List<ValidationResult> failedValidationList, Validation validation) {
        if (validation == null) {
            return;
        }
        if (disabledValidations.contains(validation.getId())
                || (!executeIds.isEmpty() && !executeIds.contains(validation.getId()))) {
            return;
        }

        ValidationResult result;
        try {
            result = validation.execute(elide);
        } catch (Throwable t) {
            String trace = ExceptionUtils.getStackTrace(t)
                                         .replace("\n", " | ")
                                         .replace("\t", "");
            result = new ValidationResult(validation, new ElideResponse(599, trace), false);
        }
        if (!result.getTestResult()) {
            failedValidationList.add(result);
        }
    }

    public int size() {
        return toExecute.size();
    }


    private HashSet<String> getExecuteIds() {
        // Use -DexecuteIds=1,2,3 ... to limit the tests to run
        final HashSet<String> strs = new HashSet<>();
        final String executeStr = System.getProperty("executeIds");
        if (executeStr != null && !executeStr.isEmpty()) {
            final String[] idStrList = executeStr.split(",");
            Collections.addAll(strs, idStrList);
        }
        return strs;
    }
}
