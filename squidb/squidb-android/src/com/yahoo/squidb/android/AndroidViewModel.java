/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.android;

import android.content.ContentValues;
import android.os.Parcel;
import android.os.Parcelable;

import com.yahoo.squidb.data.ValuesStorage;
import com.yahoo.squidb.data.ViewModel;
import com.yahoo.squidb.sql.Property;

/**
 * Extension of {@link ViewModel} that adds some Android-specific APIs and features. Android models implement
 * {@link Parcelable} and allow working with ContentValues instead of Maps. The code generator will generate view
 * models extending this subclass if the 'androidModels' option is set.
 */
public abstract class AndroidViewModel extends ViewModel implements ParcelableModel {

    @Override
    protected ValuesStorage newValuesStorage() {
        return new ContentValuesStorage();
    }

    /**
     * Copies values from the given {@link ContentValues} into the model. The values will be added to the model as read
     * values (i.e. will not be considered set values or mark the model as dirty).
     */
    public void readPropertiesFromContentValues(ContentValues values, Property<?>... properties) {
        readPropertiesFromValuesStorage(new ContentValuesStorage(values), properties);
    }

    /**
     * Analogous to {@link #readPropertiesFromContentValues(ContentValues, Property[])} but adds the values to the
     * model as set values, i.e. marks the model as dirty with these values.
     */
    public void setPropertiesFromContentValues(ContentValues values, Property<?>... properties) {
        setPropertiesFromValuesStorage(new ContentValuesStorage(values), properties);
    }

    // --- parcelable helpers

    /**
     * {@inheritDoc}
     */
    @Override
    public int describeContents() {
        return 0;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeParcelable((ContentValuesStorage) setValues, 0);
        dest.writeParcelable((ContentValuesStorage) values, 0);
    }

    @Override
    public void readFromParcel(Parcel source) {
        this.setValues = source.readParcelable(ContentValuesStorage.class.getClassLoader());
        this.values = source.readParcelable(ContentValuesStorage.class.getClassLoader());
    }
}
