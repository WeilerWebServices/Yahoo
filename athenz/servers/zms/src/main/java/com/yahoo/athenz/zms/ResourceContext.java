//
// This file generated by rdl 1.5.2. Do not modify!
//
package com.yahoo.athenz.zms;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

//
// ResourceContext
//
public interface ResourceContext {
    HttpServletRequest request();
    HttpServletResponse response();
    String getApiName();
    String getHttpMethod();
    void authenticate();
    void authorize(String action, String resource, String trustedDomain);
}
