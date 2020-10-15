/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.android;

import android.os.Parcel;
import android.os.Parcelable;

import com.yahoo.squidb.data.AbstractModel;

import java.lang.reflect.Array;

/**
 * This class is used by {@link AndroidTableModel} and {@link AndroidViewModel} subclasses to facilitate implementing
 * {@link Parcelable}
 */
public final class ModelCreator<TYPE extends AbstractModel & ParcelableModel>
        implements Parcelable.Creator<TYPE> {

    private final Class<TYPE> cls;

    public ModelCreator(Class<TYPE> cls) {
        this.cls = cls;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public TYPE createFromParcel(Parcel source) {
        TYPE model;
        try {
            model = cls.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        model.readFromParcel(source);
        return model;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @SuppressWarnings("unchecked")
    public TYPE[] newArray(int size) {
        return (TYPE[]) Array.newInstance(cls, size);
    }
}
