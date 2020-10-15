/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
package com.yahoo.elide.testing.framework.core.graph;

import com.yahoo.elide.testing.framework.core.configuration.UserProfile;
import com.yahoo.elide.testing.framework.core.visitors.EntityGraph.Visitor;
import com.yahoo.elide.testing.framework.enums.Permission;
import lombok.Getter;
import lombok.NonNull;

import javax.ws.rs.core.UriBuilder;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Base class for graph entries.
 */
public abstract class GraphNode implements Visitable {

    protected final String uriKey;
    @Getter protected List<GraphNode> lineageNodes = new ArrayList<>();

    public GraphNode(List<GraphNode> lineageNodes, @NonNull String uriKey) {
        this.uriKey = uriKey;
        if (lineageNodes != null) {
            this.lineageNodes = lineageNodes;
        }
    }

    @Override
    public abstract void accept(Visitor visitor, UserProfile forUser);
    public abstract boolean canBeAccessedByUserForPermission(UserProfile userProfile, Permission permission);

    protected GraphNode getParentNode() {
        if (lineageNodes == null || lineageNodes.isEmpty()) {
            return null;
        }
        return lineageNodes.get(lineageNodes.size() - 1);
    }

    protected List<GraphNode> getLineageIncludingSelf() {
        List<GraphNode> lineage = new ArrayList<>(lineageNodes);
        lineage.add(this);
        return lineage;
    }

    public URI generateEntityPath() {
        return getBaseURI().path(uriKey).build();
    }

    private UriBuilder getBaseURI() {
        if (lineageNodes.isEmpty()) {
            return UriBuilder.fromUri("/");
        }

        GraphNode parent = lineageNodes.get(lineageNodes.size() - 1);
        return UriBuilder.fromUri(parent.generateEntityPath());
    }
}
