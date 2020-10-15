//
// This file generated by rdl 1.5.2. Do not modify!
//

package com.yahoo.athenz.zms;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import com.yahoo.rdl.*;

//
// TenantResourceGroupRoles - A representation of tenant roles for resource
// groups to be provisioned.
//
@JsonIgnoreProperties(ignoreUnknown = true)
public class TenantResourceGroupRoles {
    public String domain;
    public String service;
    public String tenant;
    public List<TenantRoleAction> roles;
    public String resourceGroup;

    public TenantResourceGroupRoles setDomain(String domain) {
        this.domain = domain;
        return this;
    }
    public String getDomain() {
        return domain;
    }
    public TenantResourceGroupRoles setService(String service) {
        this.service = service;
        return this;
    }
    public String getService() {
        return service;
    }
    public TenantResourceGroupRoles setTenant(String tenant) {
        this.tenant = tenant;
        return this;
    }
    public String getTenant() {
        return tenant;
    }
    public TenantResourceGroupRoles setRoles(List<TenantRoleAction> roles) {
        this.roles = roles;
        return this;
    }
    public List<TenantRoleAction> getRoles() {
        return roles;
    }
    public TenantResourceGroupRoles setResourceGroup(String resourceGroup) {
        this.resourceGroup = resourceGroup;
        return this;
    }
    public String getResourceGroup() {
        return resourceGroup;
    }

    @Override
    public boolean equals(Object another) {
        if (this != another) {
            if (another == null || another.getClass() != TenantResourceGroupRoles.class) {
                return false;
            }
            TenantResourceGroupRoles a = (TenantResourceGroupRoles) another;
            if (domain == null ? a.domain != null : !domain.equals(a.domain)) {
                return false;
            }
            if (service == null ? a.service != null : !service.equals(a.service)) {
                return false;
            }
            if (tenant == null ? a.tenant != null : !tenant.equals(a.tenant)) {
                return false;
            }
            if (roles == null ? a.roles != null : !roles.equals(a.roles)) {
                return false;
            }
            if (resourceGroup == null ? a.resourceGroup != null : !resourceGroup.equals(a.resourceGroup)) {
                return false;
            }
        }
        return true;
    }
}
