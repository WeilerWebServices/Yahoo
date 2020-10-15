/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.sqlitebindings;

import android.content.Context;

import com.yahoo.squidb.data.ISQLiteDatabase;
import com.yahoo.squidb.data.ISQLiteOpenHelper;
import com.yahoo.squidb.data.SquidDatabase;

import org.sqlite.database.sqlite.SQLiteDatabase;
import org.sqlite.database.sqlite.SQLiteOpenHelper;

/**
 * SQLiteOpenHelper implementation that extends {@link org.sqlite.database.sqlite.SQLiteOpenHelper} from the Android
 * SQLite bindings project (https://www.sqlite.org/android/doc/trunk/www/index.wiki)
 */
public class SQLiteBindingsOpenHelper extends SQLiteOpenHelper implements ISQLiteOpenHelper {

    static {
        System.loadLibrary("sqliteX");
    }

    private final Context context;
    private final SquidDatabase.OpenHelperDelegate delegate;

    public SQLiteBindingsOpenHelper(Context context, String name,
            SquidDatabase.OpenHelperDelegate delegate, int version) {
        super(context.getApplicationContext(), name, null, version);
        this.context = context.getApplicationContext();
        this.delegate = delegate;
    }

    @Override
    public ISQLiteDatabase openForWriting() {
        SQLiteDatabase database = super.getWritableDatabase();
        return new SQLiteBindingsAdapter(database);
    }

    @Override
    public String getDatabasePath() {
        return context.getDatabasePath(getDatabaseName()).getAbsolutePath();
    }

    @Override
    public boolean deleteDatabase() {
        return context.deleteDatabase(getDatabaseName());
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        delegate.onCreate(new SQLiteBindingsAdapter(db));
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        delegate.onUpgrade(new SQLiteBindingsAdapter(db), oldVersion, newVersion);
    }

    @Override
    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        delegate.onDowngrade(new SQLiteBindingsAdapter(db), oldVersion, newVersion);
    }

    @Override
    public void onConfigure(SQLiteDatabase db) {
        delegate.onConfigure(new SQLiteBindingsAdapter(db));
    }

    @Override
    public void onOpen(SQLiteDatabase db) {
        delegate.onOpen(new SQLiteBindingsAdapter(db));
    }

}
