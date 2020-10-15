/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.sqlitebindings;

import com.yahoo.squidb.android.SquidCursorWrapper;
import com.yahoo.squidb.data.ICursor;
import com.yahoo.squidb.data.ISQLiteDatabase;
import com.yahoo.squidb.data.ISQLitePreparedStatement;
import com.yahoo.squidb.data.SquidTransactionListener;
import com.yahoo.squidb.utility.VersionCode;

import org.sqlite.database.sqlite.SQLiteDatabase;
import org.sqlite.database.sqlite.SQLiteStatement;
import org.sqlite.database.sqlite.SQLiteTransactionListener;

/**
 * ISQLiteDatabase implementation that wraps {@link org.sqlite.database.sqlite.SQLiteDatabase} from the Android
 * SQLite bindings project (https://www.sqlite.org/android/doc/trunk/www/index.wiki)
 */
public class SQLiteBindingsAdapter implements ISQLiteDatabase {

    /**
     * The version of SQLite bundled by default with the squidb-sqlite-bindings module. If any user builds this module
     * from source with their own version of SQLite, they should update this definition to match the version of SQLite
     * used.
     */
    public static final VersionCode SQLITE_VERSION = new VersionCode(3, 15, 0, 0);

    private final SQLiteDatabase db;

    public SQLiteBindingsAdapter(SQLiteDatabase db) {
        if (db == null) {
            throw new NullPointerException("Can't create SQLiteDatabaseAdapter with a null SQLiteDatabase");
        }
        this.db = db;
    }

    private static class SQLiteTransactionListenerAdapter implements SQLiteTransactionListener {

        private final SquidTransactionListener listener;

        private SQLiteTransactionListenerAdapter(SquidTransactionListener listener) {
            this.listener = listener;
        }

        @Override
        public void onBegin() {
            listener.onBegin();
        }

        @Override
        public void onCommit() {
            listener.onCommit();
        }

        @Override
        public void onRollback() {
            listener.onRollback();
        }
    }

    @Override
    public void beginTransaction() {
        db.beginTransaction();
    }

    @Override
    public void beginTransactionNonExclusive() {
        db.beginTransactionNonExclusive();
    }

    @Override
    public void beginTransactionWithListener(SquidTransactionListener listener) {
        db.beginTransactionWithListener(new SQLiteTransactionListenerAdapter(listener));
    }

    @Override
    public void beginTransactionWithListenerNonExclusive(SquidTransactionListener listener) {
        db.beginTransactionWithListenerNonExclusive(new SQLiteTransactionListenerAdapter(listener));
    }

    @Override
    public void endTransaction() {
        db.endTransaction();
    }

    @Override
    public void execSQL(String sql) {
        db.execSQL(sql);
    }

    @Override
    public void execSQL(String sql, Object[] bindArgs) {
        db.execSQL(sql, bindArgs);
    }

    @Override
    public boolean inTransaction() {
        return db.inTransaction();
    }

    @Override
    public boolean isOpen() {
        return db.isOpen();
    }

    @Override
    public int getVersion() {
        return db.getVersion();
    }

    @Override
    public void setVersion(int version) {
        db.setVersion(version);
    }

    @Override
    public ICursor rawQuery(String sql, Object[] bindArgs) {
        return new SquidCursorWrapper(
                db.rawQueryWithFactory(new SQLiteBindingsCursorFactory(bindArgs), sql, null, null));
    }

    @Override
    public String simpleQueryForString(String sql, Object[] bindArgs) {
        SQLiteStatement statement = null;
        try {
            statement = db.compileStatement(sql);
            SQLiteBindingsCursorFactory.bindArgumentsToProgram(statement, bindArgs);
            return statement.simpleQueryForString();
        } finally {
            if (statement != null) {
                statement.close();
            }
        }
    }

    @Override
    public long simpleQueryForLong(String sql, Object[] bindArgs) {
        SQLiteStatement statement = null;
        try {
            statement = db.compileStatement(sql);
            SQLiteBindingsCursorFactory.bindArgumentsToProgram(statement, bindArgs);
            return statement.simpleQueryForLong();
        } finally {
            if (statement != null) {
                statement.close();
            }
        }
    }

    @Override
    public void setTransactionSuccessful() {
        db.setTransactionSuccessful();
    }

    @Override
    public String toString() {
        return db.toString();
    }

    @Override
    public boolean yieldIfContendedSafely() {
        return db.yieldIfContendedSafely();
    }

    @Override
    public boolean yieldIfContendedSafely(long sleepAfterYieldDelay) {
        return db.yieldIfContendedSafely(sleepAfterYieldDelay);
    }

    @Override
    public void close() {
        db.close();
    }

    @Override
    public void disableWriteAheadLogging() {
        db.disableWriteAheadLogging();
    }

    @Override
    public boolean enableWriteAheadLogging() {
        return db.enableWriteAheadLogging();
    }

    @Override
    public boolean isWriteAheadLoggingEnabled() {
        return db.isWriteAheadLoggingEnabled();
    }

    @Override
    public long getMaximumSize() {
        return db.getMaximumSize();
    }

    @Override
    public long getPageSize() {
        return db.getPageSize();
    }

    @Override
    public String getPath() {
        return db.getPath();
    }

    @Override
    public boolean isDatabaseIntegrityOk() {
        return db.isDatabaseIntegrityOk();
    }

    @Override
    public boolean isDbLockedByCurrentThread() {
        return db.isDbLockedByCurrentThread();
    }

    @Override
    public boolean isReadOnly() {
        return db.isReadOnly();
    }

    @Override
    public boolean needUpgrade(int newVersion) {
        return db.needUpgrade(newVersion);
    }

    @Override
    public void setForeignKeyConstraintsEnabled(boolean enable) {
        db.setForeignKeyConstraintsEnabled(enable);
    }

    @Override
    public void setMaxSqlCacheSize(int cacheSize) {
        db.setMaxSqlCacheSize(cacheSize);
    }

    @Override
    public void setMaximumSize(long numBytes) {
        db.setMaximumSize(numBytes);
    }

    @Override
    public void setPageSize(long numBytes) {
        db.setPageSize(numBytes);
    }

    @Override
    public int executeUpdateDelete(String sql, Object[] bindArgs) {
        SQLiteStatement statement = null;
        try {
            statement = db.compileStatement(sql);
            SQLiteBindingsCursorFactory.bindArgumentsToProgram(statement, bindArgs);
            return statement.executeUpdateDelete();
        } finally {
            if (statement != null) {
                statement.close();
            }
        }
    }

    @Override
    public long executeInsert(String sql, Object[] bindArgs) {
        SQLiteStatement statement = null;
        try {
            statement = db.compileStatement(sql);
            SQLiteBindingsCursorFactory.bindArgumentsToProgram(statement, bindArgs);
            return statement.executeInsert();
        } finally {
            if (statement != null) {
                statement.close();
            }
        }
    }

    @Override
    public void ensureSqlCompiles(String sql) {
        SQLiteStatement statement = null;
        try {
            statement = db.compileStatement(sql);
        } finally {
            if (statement != null) {
                statement.close();
            }
        }
    }

    @Override
    public ISQLitePreparedStatement prepareStatement(String sql) {
        return new SQLiteBindingsStatementAdapter(db.compileStatement(sql));
    }

    @Override
    public SQLiteDatabase getWrappedObject() {
        return db;
    }
}
