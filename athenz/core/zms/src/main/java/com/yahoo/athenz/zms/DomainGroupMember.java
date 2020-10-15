//
// This file generated by rdl 1.5.2. Do not modify!
//

package com.yahoo.athenz.zms;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import com.yahoo.rdl.*;

//
// DomainGroupMember -
//
@JsonIgnoreProperties(ignoreUnknown = true)
public class DomainGroupMember {
    public String memberName;
    public List<GroupMember> memberGroups;

    public DomainGroupMember setMemberName(String memberName) {
        this.memberName = memberName;
        return this;
    }
    public String getMemberName() {
        return memberName;
    }
    public DomainGroupMember setMemberGroups(List<GroupMember> memberGroups) {
        this.memberGroups = memberGroups;
        return this;
    }
    public List<GroupMember> getMemberGroups() {
        return memberGroups;
    }

    @Override
    public boolean equals(Object another) {
        if (this != another) {
            if (another == null || another.getClass() != DomainGroupMember.class) {
                return false;
            }
            DomainGroupMember a = (DomainGroupMember) another;
            if (memberName == null ? a.memberName != null : !memberName.equals(a.memberName)) {
                return false;
            }
            if (memberGroups == null ? a.memberGroups != null : !memberGroups.equals(a.memberGroups)) {
                return false;
            }
        }
        return true;
    }
}