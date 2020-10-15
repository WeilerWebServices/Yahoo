/*
 * Copyright (C) 2006 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.yahoo.android.sqlite;

import com.yahoo.squidb.data.ICursor;

import java.util.Locale;

/**
 * Static utility methods for dealing with databases
 *
 * Forked from android.database.DatabaseUtils, contains only the required methods
 */
public class DatabaseUtils {

    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_SELECT = 1;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_UPDATE = 2;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_ATTACH = 3;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_BEGIN = 4;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_COMMIT = 5;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_ABORT = 6;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_PRAGMA = 7;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_DDL = 8;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_UNPREPARED = 9;
    /** One of the values returned by {@link #getSqlStatementType(String)}. */
    public static final int STATEMENT_OTHER = 99;

    /**
     * Returns one of the following which represent the type of the given SQL statement.
     * <ol>
     * <li>{@link #STATEMENT_SELECT}</li>
     * <li>{@link #STATEMENT_UPDATE}</li>
     * <li>{@link #STATEMENT_ATTACH}</li>
     * <li>{@link #STATEMENT_BEGIN}</li>
     * <li>{@link #STATEMENT_COMMIT}</li>
     * <li>{@link #STATEMENT_ABORT}</li>
     * <li>{@link #STATEMENT_OTHER}</li>
     * </ol>
     *
     * @param sql the SQL statement whose type is returned by this method
     * @return one of the values listed above
     */
    public static int getSqlStatementType(String sql) {
        sql = sql.trim();
        if (sql.length() < 3) {
            return STATEMENT_OTHER;
        }
        String prefixSql = sql.substring(0, 3).toUpperCase(Locale.ROOT);
        if (prefixSql.equals("SEL")) {
            return STATEMENT_SELECT;
        } else if (prefixSql.equals("INS") ||
                prefixSql.equals("UPD") ||
                prefixSql.equals("REP") ||
                prefixSql.equals("DEL")) {
            return STATEMENT_UPDATE;
        } else if (prefixSql.equals("ATT")) {
            return STATEMENT_ATTACH;
        } else if (prefixSql.equals("COM")) {
            return STATEMENT_COMMIT;
        } else if (prefixSql.equals("END")) {
            return STATEMENT_COMMIT;
        } else if (prefixSql.equals("ROL")) {
            return STATEMENT_ABORT;
        } else if (prefixSql.equals("BEG")) {
            return STATEMENT_BEGIN;
        } else if (prefixSql.equals("PRA")) {
            return STATEMENT_PRAGMA;
        } else if (prefixSql.equals("CRE") || prefixSql.equals("DRO") ||
                prefixSql.equals("ALT")) {
            return STATEMENT_DDL;
        } else if (prefixSql.equals("ANA") || prefixSql.equals("DET")) {
            return STATEMENT_UNPREPARED;
        }
        return STATEMENT_OTHER;
    }

    /**
     * Returns data type of the given object's value.
     * <p>
     * Returned values are
     * <ul>
     * <li>{@link Cursor#FIELD_TYPE_NULL}</li>
     * <li>{@link Cursor#FIELD_TYPE_INTEGER}</li>
     * <li>{@link Cursor#FIELD_TYPE_FLOAT}</li>
     * <li>{@link Cursor#FIELD_TYPE_STRING}</li>
     * <li>{@link Cursor#FIELD_TYPE_BLOB}</li>
     * </ul>
     * </p>
     *
     * @param obj the object whose value type is to be returned
     * @return object value type
     * @hide
     */
    public static int getTypeOfObject(Object obj) {
        if (obj == null) {
            return ICursor.FIELD_TYPE_NULL;
        } else if (obj instanceof byte[]) {
            return ICursor.FIELD_TYPE_BLOB;
        } else if (obj instanceof Float || obj instanceof Double) {
            return ICursor.FIELD_TYPE_FLOAT;
        } else if (obj instanceof Long || obj instanceof Integer
                || obj instanceof Short || obj instanceof Byte) {
            return ICursor.FIELD_TYPE_INTEGER;
        } else {
            return ICursor.FIELD_TYPE_STRING;
        }
    }

    /**
     * Returns column index of "_id" column, or -1 if not found.
     */
    public static int findRowIdColumnIndex(String[] columnNames) {
        int length = columnNames.length;
        for (int i = 0; i < length; i++) {
            if (columnNames[i].equals("_id")) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Picks a start position for {@link Cursor#fillWindow} such that the
     * window will contain the requested row and a useful range of rows
     * around it.
     *
     * When the data set is too large to fit in a cursor window, seeking the
     * cursor can become a very expensive operation since we have to run the
     * query again when we move outside the bounds of the current window.
     *
     * We try to choose a start position for the cursor window such that
     * 1/3 of the window's capacity is used to hold rows before the requested
     * position and 2/3 of the window's capacity is used to hold rows after the
     * requested position.
     *
     * @param cursorPosition The row index of the row we want to get.
     * @param cursorWindowCapacity The estimated number of rows that can fit in
     * a cursor window, or 0 if unknown.
     * @return The recommended start position, always less than or equal to
     * the requested row.
     * @hide
     */
    public static int cursorPickFillWindowStartPosition(
            int cursorPosition, int cursorWindowCapacity) {
        return Math.max(cursorPosition - cursorWindowCapacity / 3, 0);
    }

    /**
     * Appends an SQL string to the given StringBuilder, including the opening
     * and closing single quotes. Any single quotes internal to sqlString will
     * be escaped.
     *
     * This method is deprecated because we want to encourage everyone
     * to use the "?" binding form.  However, when implementing a
     * ContentProvider, one may want to add WHERE clauses that were
     * not provided by the caller.  Since "?" is a positional form,
     * using it in this case could break the caller because the
     * indexes would be shifted to accomodate the ContentProvider's
     * internal bindings.  In that case, it may be necessary to
     * construct a WHERE clause manually.  This method is useful for
     * those cases.
     *
     * @param sb the StringBuilder that the SQL string will be appended to
     * @param sqlString the raw string to be appended, which may contain single
     * quotes
     */
    public static void appendEscapedSQLString(StringBuilder sb, String sqlString) {
        sb.append('\'');
        if (sqlString.indexOf('\'') != -1) {
            int length = sqlString.length();
            for (int i = 0; i < length; i++) {
                char c = sqlString.charAt(i);
                if (c == '\'') {
                    sb.append('\'');
                }
                sb.append(c);
            }
        } else {
            sb.append(sqlString);
        }
        sb.append('\'');
    }

    /**
     * Utility method to run the query on the db and return the value in the
     * first column of the first row.
     */
    public static long longForQuery(SQLiteDatabase db, String query, String[] selectionArgs) {
        SQLiteStatement prog = db.compileStatement(query);
        try {
            return longForQuery(prog, selectionArgs);
        } finally {
            prog.close();
        }
    }

    /**
     * Utility method to run the pre-compiled query and return the value in the
     * first column of the first row.
     */
    public static long longForQuery(SQLiteStatement prog, String[] selectionArgs) {
        prog.bindAllArgsAsStrings(selectionArgs);
        return prog.simpleQueryForLong();
    }

    /**
     * Fills the specified cursor window by iterating over the contents of the cursor.
     * The window is filled until the cursor is exhausted or the window runs out
     * of space.
     *
     * The original position of the cursor is left unchanged by this operation.
     *
     * @param cursor The cursor that contains the data to put in the window.
     * @param position The start position for filling the window.
     * @param window The window to fill.
     * @hide
     */
    public static void cursorFillWindow(final ICursor cursor,
            int position, final CursorWindow window) {
        if (position < 0 || position >= cursor.getCount()) {
            return;
        }
        final int oldPos = cursor.getPosition();
        final int numColumns = cursor.getColumnCount();
        window.clear();
        window.setStartPosition(position);
        window.setNumColumns(numColumns);
        if (cursor.moveToPosition(position)) {
            do {
                if (!window.allocRow()) {
                    break;
                }
                for (int i = 0; i < numColumns; i++) {
                    final int type = cursor.getType(i);
                    final boolean success;
                    switch (type) {
                        case ICursor.FIELD_TYPE_NULL:
                            success = window.putNull(position, i);
                            break;

                        case ICursor.FIELD_TYPE_INTEGER:
                            success = window.putLong(cursor.getLong(i), position, i);
                            break;

                        case ICursor.FIELD_TYPE_FLOAT:
                            success = window.putDouble(cursor.getDouble(i), position, i);
                            break;

                        case ICursor.FIELD_TYPE_BLOB: {
                            final byte[] value = cursor.getBlob(i);
                            success = value != null ? window.putBlob(value, position, i)
                                    : window.putNull(position, i);
                            break;
                        }

                        default: // assume value is convertible to String
                        case ICursor.FIELD_TYPE_STRING: {
                            final String value = cursor.getString(i);
                            success = value != null ? window.putString(value, position, i)
                                    : window.putNull(position, i);
                            break;
                        }
                    }
                    if (!success) {
                        window.freeLastRow();
                        break;
                    }
                }
                position += 1;
            } while (cursor.moveToNext());
        }
        cursor.moveToPosition(oldPos);
    }

    /**
     * Binds the given Object to the given SQLiteProgram using the proper
     * typing. For example, bind numbers as longs/doubles, and everything else
     * as a string by call toString() on it.
     *
     * @param prog the program to bind the object to
     * @param index the 1-based index to bind at
     * @param value the value to bind
     */
    public static void bindObjectToProgram(SQLiteProgram prog, int index,
            Object value) {
        if (value == null) {
            prog.bindNull(index);
        } else if (value instanceof Double || value instanceof Float) {
            prog.bindDouble(index, ((Number) value).doubleValue());
        } else if (value instanceof Number) {
            prog.bindLong(index, ((Number) value).longValue());
        } else if (value instanceof Boolean) {
            Boolean bool = (Boolean) value;
            if (bool) {
                prog.bindLong(index, 1);
            } else {
                prog.bindLong(index, 0);
            }
        } else if (value instanceof byte[]) {
            prog.bindBlob(index, (byte[]) value);
        } else {
            prog.bindString(index, value.toString());
        }
    }
}
