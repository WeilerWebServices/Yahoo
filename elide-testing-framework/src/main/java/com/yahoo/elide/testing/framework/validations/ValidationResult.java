/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.validations;

import com.yahoo.elide.ElideResponse;

/**
 * The results of a validation.
 */
public class ValidationResult {

    private boolean testResult;
    private Validation validation;
    private ElideResponse response;

    public ValidationResult(Validation validation, ElideResponse response, boolean testResult) {
        this.validation = validation;
        this.response = response;
        this.testResult = testResult;
    }

    public boolean getTestResult() {
        return testResult;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(testResult ? "Success: " : "Failure: ");
        builder.append(validation.toString())
               .append("\t");
        if (!testResult) {
            builder.append("Body: ")
                   .append(response.getBody())
                   .append("\t");
        }
        return builder.toString();
    }
}
