/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.processor.data;

import com.yahoo.aptutils.model.DeclaredTypeName;
import com.yahoo.aptutils.model.TypeName;
import com.yahoo.aptutils.utils.AptUtils;
import com.yahoo.squidb.annotations.Ignore;
import com.yahoo.squidb.processor.TypeConstants;
import com.yahoo.squidb.processor.plugins.PluginBundle;
import com.yahoo.squidb.processor.plugins.PluginEnvironment;
import com.yahoo.squidb.processor.plugins.defaults.properties.generators.PropertyGenerator;

import java.lang.annotation.Annotation;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.lang.model.element.VariableElement;
import javax.tools.Diagnostic;

/**
 * Base class for data representing a model spec. This class holds the following pieces of information common to all
 * types of models (table models, view models, and inherited models):
 * <ul>
 * <li>The model spec annotation itself (see {@link #getSpecAnnotation()})</li>
 * <li>The {@link TypeElement} representing the model spec class (see {@link #getModelSpecElement()})</li>
 * <li>The name of the TypeElement (see {@link #getModelSpecName()})</li>
 * <li>The name of the class to be generated (see {@link #getGeneratedClassName()})</li>
 * <li>A list of {@link PropertyGenerator}s for the generated model's fields
 * (see {@link #getPropertyGenerators()})</li>
 * <li>A list of {@link PropertyGenerator}s for the generated model's deprecated fields
 * (see {@link #getDeprecatedPropertyGenerators()})</li>
 * </ul>
 * <p>
 * Plugins can also store arbitrary metadata in a model spec using {@link #putMetadata(String, Object)} and
 * {@link #getMetadata(String)}
 */
public abstract class ModelSpec<T extends Annotation> {

    protected final T modelSpecAnnotation;
    protected final DeclaredTypeName generatedClassName;
    protected final DeclaredTypeName modelSpecName;
    protected final TypeElement modelSpecElement;

    private final List<PropertyGenerator> propertyGenerators = new ArrayList<>();
    private final List<PropertyGenerator> deprecatedPropertyGenerators = new ArrayList<>();
    private final Map<String, Object> metadataMap = new HashMap<>();

    protected final AptUtils utils;
    protected final PluginBundle pluginBundle;
    private final PluginEnvironment pluginEnvironment;
    private final DeclaredTypeName modelSuperclass;

    private final List<ErrorInfo> loggedErrors = new ArrayList<>();

    public interface ModelSpecVisitor<RETURN, PARAMETER> {

        RETURN visitTableModel(TableModelSpecWrapper modelSpec, PARAMETER data);

        RETURN visitViewModel(ViewModelSpecWrapper modelSpec, PARAMETER data);

        RETURN visitInheritedModel(InheritedModelSpecWrapper modelSpec, PARAMETER data);
    }

    public ModelSpec(TypeElement modelSpecElement, Class<T> modelSpecClass,
            PluginEnvironment pluginEnv, AptUtils utils) {
        this.utils = utils;
        this.modelSpecElement = modelSpecElement;
        this.modelSpecName = new DeclaredTypeName(modelSpecElement.getQualifiedName().toString());
        this.modelSpecAnnotation = modelSpecElement.getAnnotation(modelSpecClass);
        this.generatedClassName = new DeclaredTypeName(modelSpecName.getPackageName(), getGeneratedClassNameString());
        this.pluginEnvironment = pluginEnv;
        this.pluginBundle = pluginEnv.getPluginBundleForModelSpec(this);

        processVariableElements();
        pluginBundle.afterProcessVariableElements();
        modelSuperclass = initializeModelSuperclass();
    }

    private void processVariableElements() {
        for (Element e : modelSpecElement.getEnclosedElements()) {
            if (e instanceof VariableElement && e.getAnnotation(Ignore.class) == null) {
                TypeName typeName = utils.getTypeNameFromTypeMirror(e.asType());
                if (!(typeName instanceof DeclaredTypeName)) {
                    utils.getMessager().printMessage(Diagnostic.Kind.WARNING,
                            "Element type " + typeName + " is not a concrete type, will be ignored", e);
                } else if (!pluginBundle.processVariableElement((VariableElement) e, (DeclaredTypeName) typeName)) {
                    // Deprecated things are generally ignored by plugins, so don't warn about them
                    // private static final fields are generally internal model spec constants, so don't warn about them
                    if (e.getAnnotation(Deprecated.class) == null &&
                            !e.getModifiers().containsAll(TypeConstants.PRIVATE_STATIC_FINAL)) {
                        utils.getMessager().printMessage(Diagnostic.Kind.WARNING,
                                "No plugin found to handle field", e);
                    }
                }
            }
        }
    }

    private DeclaredTypeName initializeModelSuperclass() {
        DeclaredTypeName pluginSuperclass = pluginBundle.getModelSuperclass();
        if (pluginSuperclass != null) {
            return pluginSuperclass;
        }
        return getDefaultModelSuperclass();
    }

    public abstract <RETURN, PARAMETER> RETURN accept(ModelSpecVisitor<RETURN, PARAMETER> visitor, PARAMETER data);

    protected abstract String getGeneratedClassNameString();

    /**
     * @return the name of the default superclass for the generated model. This may be overridden by a plugin
     */
    protected abstract DeclaredTypeName getDefaultModelSuperclass();

    /**
     * @return the name of the superclass for the generated model
     */
    public final DeclaredTypeName getModelSuperclass() {
        return modelSuperclass;
    }

    /**
     * Adds imports required by this model spec to the given accumulator set
     *
     * @param imports accumulator set
     */
    public final void addRequiredImports(Set<DeclaredTypeName> imports) {
        imports.add(TypeConstants.PROPERTY); // For PROPERTIES array
        imports.add(TypeConstants.VALUES_STORAGE);
        imports.add(getModelSuperclass());
        for (PropertyGenerator generator : propertyGenerators) {
            generator.registerRequiredImports(imports);
        }
        addModelSpecificImports(imports);
        pluginBundle.addRequiredImports(imports);
    }

    protected abstract void addModelSpecificImports(Set<DeclaredTypeName> imports);

    /**
     * @return a {@link PluginBundle} for this model spec
     */
    public PluginBundle getPluginBundle() {
        return pluginBundle;
    }

    /**
     * @return the name of the model spec class
     */
    public DeclaredTypeName getModelSpecName() {
        return modelSpecName;
    }

    /**
     * @return the name of the generated model class
     */
    public DeclaredTypeName getGeneratedClassName() {
        return generatedClassName;
    }

    /**
     * @return the {@link TypeElement} for the model spec class
     */
    public TypeElement getModelSpecElement() {
        return modelSpecElement;
    }

    /**
     * @return the model spec annotation (e.g. an instance of {@link com.yahoo.squidb.annotations.TableModelSpec})
     */
    public T getSpecAnnotation() {
        return modelSpecAnnotation;
    }

    /**
     * @return a list of {@link PropertyGenerator}s for the fields in the generated model
     */
    public List<PropertyGenerator> getPropertyGenerators() {
        return propertyGenerators;
    }

    /**
     * Add a {@link PropertyGenerator} to the model spec
     */
    public void addPropertyGenerator(PropertyGenerator propertyGenerator) {
        propertyGenerators.add(propertyGenerator);
    }

    /**
     * @return a list of {@link PropertyGenerator}s for deprecated fields in the generated model
     */
    public List<PropertyGenerator> getDeprecatedPropertyGenerators() {
        return deprecatedPropertyGenerators;
    }

    /**
     * Add a deprecated {@link PropertyGenerator} to the model spec
     */
    public void addDeprecatedPropertyGenerator(PropertyGenerator propertyGenerator) {
        deprecatedPropertyGenerators.add(propertyGenerator);
    }

    /**
     * Attach arbitrary metadata to this model spec objects. Plugins can store metadata and then retrieve it later with
     * {@link #getMetadata(String)}
     *
     * @param metadataKey key for storing/retrieving the metadata
     * @param metadata the metadata to store
     * @see #hasMetadata(String)
     * @see #getMetadata(String)
     */
    public void putMetadata(String metadataKey, Object metadata) {
        metadataMap.put(metadataKey, metadata);
    }

    /**
     * @param metadataKey the metadata key to look up
     * @return true if there is metadata stored for the given key, false otherwise
     * @see #putMetadata(String, Object)
     * @see #getMetadata(String)
     */
    public boolean hasMetadata(String metadataKey) {
        return metadataMap.containsKey(metadataKey);
    }

    /**
     * Retrieve metadata that was previously attached with {@link #putMetadata(String, Object)}
     *
     * @param metadataKey key for storing/retrieving metadata
     * @return the metadata object for the given key if one was found, null otherwise
     * @see #putMetadata(String, Object)
     * @see #hasMetadata(String)
     */
    @SuppressWarnings("unchecked")
    public <TYPE> TYPE getMetadata(String metadataKey) {
        return (TYPE) metadataMap.get(metadataKey);
    }

    /**
     * Log an error to this model spec.
     *
     * This is generally intended for logging things like validation errors. Such errors do not stop the code
     * generation process (as logging an error using Messager and Kind.ERROR would), but instead generate
     * temporary code in the model class that will be picked up by a subsequent annotation processor and logged as
     * errors in a later round of annotation processing. This mechanism is designed to work around the fact that
     * logging Kind.ERROR messages during early rounds of annotation processing may suppress those errors, because
     * failing early during annotation processing can lead to a large number of "symbol not found" errors, which in
     * turn mask other validation errors.
     * <p>
     * If {@link PluginEnvironment#OPTIONS_USE_STANDARD_ERROR_LOGGING} is passed as an option to the code generator,
     * this SquiDB workaround is disabled and this method will log an error using a standard printMessage() call with
     * Kind.ERROR.
     *
     * @param message the error message to be logged
     * @param element the specific inner element in the model spec that is causing this error (e.g. a field or method),
     * or null for a general error
     */
    public void logError(String message, Element element) {
        if (pluginEnvironment.hasSquidbOption(PluginEnvironment.OPTIONS_USE_STANDARD_ERROR_LOGGING)) {
            utils.getMessager().printMessage(Diagnostic.Kind.ERROR, message, element);
        } else {
            boolean isRootElement = element == null || element.equals(getModelSpecElement());
            loggedErrors.add(new ErrorInfo(getModelSpecName(),
                    isRootElement ? "" : element.getSimpleName().toString(), message));
        }
    }

    /**
     * @return the list of errors logged to this model spec
     */
    public List<ErrorInfo> getLoggedErrors() {
        return loggedErrors;
    }
}
