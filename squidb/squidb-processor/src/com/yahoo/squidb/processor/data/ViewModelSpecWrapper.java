/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.processor.data;

import com.yahoo.aptutils.model.DeclaredTypeName;
import com.yahoo.aptutils.utils.AptUtils;
import com.yahoo.squidb.annotations.ViewModelSpec;
import com.yahoo.squidb.annotations.ViewQuery;
import com.yahoo.squidb.processor.SqlUtils;
import com.yahoo.squidb.processor.TypeConstants;
import com.yahoo.squidb.processor.plugins.PluginEnvironment;

import java.util.Set;

import javax.lang.model.element.TypeElement;
import javax.lang.model.element.VariableElement;

public class ViewModelSpecWrapper extends ModelSpec<ViewModelSpec> {

    public static final String METADATA_KEY_QUERY_ELEMENT = "queryElement";
    public static final String METADATA_KEY_VIEW_QUERY = "viewQuery";

    public ViewModelSpecWrapper(TypeElement modelSpecElement, PluginEnvironment pluginEnv, AptUtils utils) {
        super(modelSpecElement, ViewModelSpec.class, pluginEnv, utils);
        checkViewName();
    }

    private void checkViewName() {
        String viewName = getSpecAnnotation().viewName().trim();
        if (viewName.toLowerCase().startsWith("sqlite_")) {
            logError("View names cannot start with 'sqlite_'; such names are reserved for internal use",
                    getModelSpecElement());
        } else {
            SqlUtils.checkIdentifier(viewName, "view", this, getModelSpecElement(), utils);
        }
    }

    @Override
    public <RETURN, PARAMETER> RETURN accept(ModelSpecVisitor<RETURN, PARAMETER> visitor, PARAMETER data) {
        return visitor.visitViewModel(this, data);
    }

    @Override
    protected String getGeneratedClassNameString() {
        return modelSpecAnnotation.className();
    }

    @Override
    protected DeclaredTypeName getDefaultModelSuperclass() {
        return TypeConstants.VIEW_MODEL;
    }

    /**
     * @return a {@link VariableElement} representing the query in the model spec that should define the view
     */
    public VariableElement getQueryElement() {
        return getMetadata(METADATA_KEY_QUERY_ELEMENT);
    }

    /**
     * @return the {@link ViewQuery} annotation for the query element
     * @see #getQueryElement()
     */
    public ViewQuery getViewQueryAnnotation() {
        return getMetadata(METADATA_KEY_VIEW_QUERY);
    }

    @Override
    protected void addModelSpecificImports(Set<DeclaredTypeName> imports) {
        if (hasMetadata(METADATA_KEY_QUERY_ELEMENT)) {
            if (modelSpecAnnotation.isSubquery()) {
                imports.add(TypeConstants.SUBQUERY_TABLE);
            } else {
                imports.add(TypeConstants.VIEW);
            }
            imports.add(TypeConstants.QUERY);
        }
    }
}
