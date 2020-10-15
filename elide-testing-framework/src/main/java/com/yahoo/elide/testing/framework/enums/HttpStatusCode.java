/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * The status codes that elide will return.
 */
@AllArgsConstructor
public enum HttpStatusCode {
    OK(200),
    CREATED(201),
    NO_CONTENT(204),
    FORBIDDEN(403),
    NOT_FOUND(404)
    ;

    @Getter private int statusCode;

}
