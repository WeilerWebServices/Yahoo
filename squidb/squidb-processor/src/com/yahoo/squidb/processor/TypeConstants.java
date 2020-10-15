/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.processor;

import com.yahoo.aptutils.model.CoreTypes;
import com.yahoo.aptutils.model.DeclaredTypeName;
import com.yahoo.aptutils.model.GenericName;
import com.yahoo.aptutils.utils.AptUtils;
import com.yahoo.squidb.processor.plugins.defaults.properties.generators.BasicIntegerPropertyGenerator;
import com.yahoo.squidb.processor.plugins.defaults.properties.generators.BasicLongPropertyGenerator;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.lang.model.element.Modifier;
import javax.lang.model.element.VariableElement;

public class TypeConstants {

    public static final List<Modifier> PUBLIC_STATIC_FINAL = Arrays
            .asList(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL);
    public static final List<Modifier> PRIVATE_STATIC_FINAL = Arrays
            .asList(Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL);
    public static final List<Modifier> STATIC_FINAL = Arrays
            .asList(Modifier.STATIC, Modifier.FINAL);

    public static boolean isConstant(VariableElement field) {
        Set<Modifier> modifiers = field.getModifiers();
        return modifiers != null && modifiers.containsAll(STATIC_FINAL);
    }

    public static boolean isVisibleConstant(VariableElement field) {
        return isConstant(field) && !field.getModifiers().contains(Modifier.PRIVATE);
    }

    public static final String SQUIDB_PACKAGE = "com.yahoo.squidb";
    public static final String SQUIDB_SQL_PACKAGE = SQUIDB_PACKAGE + ".sql";
    public static final String SQUIDB_DATA_PACKAGE = SQUIDB_PACKAGE + ".data";
    public static final String SQUIDB_ANDROID_PACKAGE = SQUIDB_PACKAGE + ".android";
    public static final String SQUIDB_UTILITY_PACKAGE = SQUIDB_PACKAGE + ".utility";

    public static final DeclaredTypeName CREATOR = new DeclaredTypeName("android.os.Parcelable.Creator");

    public static final DeclaredTypeName VALUES_STORAGE = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "ValuesStorage");
    public static final DeclaredTypeName MAP_VALUES_STORAGE
            = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "MapValuesStorage");
    public static final DeclaredTypeName CONTENT_VALUES = new DeclaredTypeName("android.content.ContentValues");
    public static final DeclaredTypeName MAP = new DeclaredTypeName("java.util.Map");
    public static final DeclaredTypeName MAP_VALUES = MAP.clone();

    static {
        MAP_VALUES.setTypeArgs(Arrays.asList(CoreTypes.JAVA_STRING, CoreTypes.JAVA_OBJECT));
    }

    public static final DeclaredTypeName ABSTRACT_MODEL = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "AbstractModel");
    public static final DeclaredTypeName TABLE_MODEL = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "TableModel");
    public static final DeclaredTypeName VIEW_MODEL = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "ViewModel");

    public static final DeclaredTypeName ANDROID_TABLE_MODEL
            = new DeclaredTypeName(SQUIDB_ANDROID_PACKAGE, "AndroidTableModel");
    public static final DeclaredTypeName ANDROID_VIEW_MODEL
            = new DeclaredTypeName(SQUIDB_ANDROID_PACKAGE, "AndroidViewModel");

    public static final DeclaredTypeName TABLE_MAPPING_VISITORS = new DeclaredTypeName(VIEW_MODEL.toString(),
            "TableMappingVisitors");
    public static final DeclaredTypeName MODEL_CREATOR = new DeclaredTypeName(SQUIDB_ANDROID_PACKAGE,
            "ModelCreator");
    public static final DeclaredTypeName SQUID_CURSOR = new DeclaredTypeName(SQUIDB_DATA_PACKAGE, "SquidCursor");
    public static final DeclaredTypeName QUERY = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "Query");
    public static final DeclaredTypeName SQL_TABLE = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "SqlTable");
    public static final DeclaredTypeName TABLE = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "Table");
    public static final DeclaredTypeName VIRTUAL_TABLE = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "VirtualTable");
    public static final DeclaredTypeName VIEW = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "View");
    public static final DeclaredTypeName SUBQUERY_TABLE = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "SubqueryTable");
    public static final DeclaredTypeName TABLE_MODEL_NAME = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "TableModelName");

    public static final DeclaredTypeName BYTE_ARRAY;

    static {
        BYTE_ARRAY = CoreTypes.PRIMITIVE_BYTE.clone();
        BYTE_ARRAY.setArrayDepth(1);
    }

    public static final DeclaredTypeName PROPERTY = new DeclaredTypeName(SQUIDB_SQL_PACKAGE, "Property");
    public static final DeclaredTypeName LONG_PROPERTY = new DeclaredTypeName(PROPERTY.toString(), "LongProperty");
    public static final DeclaredTypeName INTEGER_PROPERTY = new DeclaredTypeName(PROPERTY.toString(),
            "IntegerProperty");
    public static final DeclaredTypeName DOUBLE_PROPERTY = new DeclaredTypeName(PROPERTY.toString(), "DoubleProperty");
    public static final DeclaredTypeName STRING_PROPERTY = new DeclaredTypeName(PROPERTY.toString(), "StringProperty");
    public static final DeclaredTypeName BOOLEAN_PROPERTY = new DeclaredTypeName(PROPERTY.toString(),
            "BooleanProperty");
    public static final DeclaredTypeName BLOB_PROPERTY = new DeclaredTypeName(PROPERTY.toString(), "BlobProperty");
    public static final DeclaredTypeName ENUM_PROPERTY = new DeclaredTypeName(PROPERTY.toString(), "EnumProperty");

    public static final DeclaredTypeName PROPERTY_ARRAY;
    public static final DeclaredTypeName PROPERTY_VARARGS;

    static {
        PROPERTY.setTypeArgs(Collections.singletonList(GenericName.DEFAULT_WILDCARD));

        PROPERTY_ARRAY = PROPERTY.clone();
        PROPERTY_ARRAY.setArrayDepth(1);

        PROPERTY_VARARGS = PROPERTY.clone();
        PROPERTY_VARARGS.setArrayDepth(1);
        PROPERTY_VARARGS.setIsVarArgs(true);
    }

    private static final Set<DeclaredTypeName> BASIC_PROPERTY_TYPES = new HashSet<>();

    static {
        BASIC_PROPERTY_TYPES.add(TypeConstants.BLOB_PROPERTY);
        BASIC_PROPERTY_TYPES.add(TypeConstants.BOOLEAN_PROPERTY);
        BASIC_PROPERTY_TYPES.add(TypeConstants.DOUBLE_PROPERTY);
        BASIC_PROPERTY_TYPES.add(TypeConstants.INTEGER_PROPERTY);
        BASIC_PROPERTY_TYPES.add(TypeConstants.LONG_PROPERTY);
        BASIC_PROPERTY_TYPES.add(TypeConstants.STRING_PROPERTY);
    }

    public static boolean isBasicPropertyType(DeclaredTypeName type) {
        return BASIC_PROPERTY_TYPES.contains(type);
    }

    public static boolean isPrimitiveType(DeclaredTypeName type) {
        return AptUtils.isEmpty(type.getPackageName());
    }

    public static boolean isIntegerType(DeclaredTypeName type) {
        return BasicIntegerPropertyGenerator.handledColumnTypes().contains(type) ||
                BasicLongPropertyGenerator.handledColumnTypes().contains(type);
    }
}
