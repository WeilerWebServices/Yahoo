//
//  OpenForecast - open source, general-purpose forecasting package.
//  Copyright (C) 2002-2011  Steven R. Gould
//
//  This library is free software; you can redistribute it and/or
//  modify it under the terms of the GNU Lesser General Public
//  License as published by the Free Software Foundation; either
//  version 2.1 of the License, or (at your option) any later version.
//
//  This library is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//  Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public
//  License along with this library; if not, write to the Free Software
//  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//

// Olympic scoring model considers the average of the last k weeks
// (dropping the b highest and lowest values) as the current prediction.

package com.yahoo.egads.models.tsmm;

import com.yahoo.egads.data.*;
import com.yahoo.egads.data.TimeSeries.Entry;
import org.json.JSONObject;
import org.json.JSONStringer;
import java.util.Properties;
import net.sourceforge.openforecast.DataSet;
import net.sourceforge.openforecast.ForecastingModel;
import net.sourceforge.openforecast.DataPoint;
import net.sourceforge.openforecast.Observation;
import java.util.*;

// Triple exponential smoothing - also known as the Winters method - is a refinement of the popular double exponential
// smoothing model but adds another component which takes into account any seasonality - or periodicity - in the data.
public class TripleExponentialSmoothingModel extends TimeSeriesAbstractModel {
    // methods ////////////////////////////////////////////////

    // The model that will be used for forecasting.
    private ForecastingModel forecaster;

    // Stores the historical values.
    private TimeSeries.DataSequence data;

    //Store the smoothing factors for level, trend and seasonality
    private final double alpha;
    private final double beta;
    private final double gamma;

    public TripleExponentialSmoothingModel(Properties config) {
        super(config);

        String temp = config.getProperty("ALPHA", "0.75");
        if (temp == null || temp.isEmpty()) {
            throw new IllegalArgumentException("ALPHA is required, "
                    + "e.g. 0.2 or 0.5");
        }
        alpha = Double.parseDouble(temp);
        temp = config.getProperty("BETA", "0.001");
        if (temp == null || temp.isEmpty()) {
            throw new IllegalArgumentException("BETA is required, "
                    + "e.g. 0.2 or 0.5");
        }
        beta = Double.parseDouble(temp);
        temp = config.getProperty("GAMMA", "0.001");
        if (temp == null || temp.isEmpty()) {
            throw new IllegalArgumentException("GAMMA is required, "
                    + "e.g. 0.2 or 0.5");
        }
        gamma = Double.parseDouble(temp);
        modelName = "TripleExponentialSmoothingModel";
    }

    public void reset() {
        // At this point, reset does nothing.
    }

    public void train(TimeSeries.DataSequence data) {
        this.data = data;
        int n = data.size();
        DataPoint dp = null;
        DataSet observedData = new DataSet();
        for (int i = 0; i < n; i++) {
            dp = new Observation(data.get(i).value);
            dp.setIndependentValue("x", i);
            observedData.add(dp);
        }
        observedData.setTimeVariable("x");
        observedData.setPeriodsPerYear(12);

        forecaster = new net.sourceforge.openforecast.models.TripleExponentialSmoothingModel(alpha, beta, gamma);
        forecaster.init(observedData);
        initForecastErrors(forecaster, data);

        logger.debug(getBias() + "\t" + getMAD() + "\t" + getMAPE() + "\t" + getMSE() + "\t" + getSAE() + "\t" + 0 + "\t" + 0);
    }

    public void update(TimeSeries.DataSequence data) {

    }

    public String getModelName() {
        return modelName;
    }

    public void predict(TimeSeries.DataSequence sequence) throws Exception {
        int n = data.size();
        DataSet requiredDataPoints = new DataSet();
        DataPoint dp;

        for (int count = 0; count < n; count++) {
            dp = new Observation(0.0);
            dp.setIndependentValue("x", count);
            requiredDataPoints.add(dp);
        }
        forecaster.forecast(requiredDataPoints);

        // Output the results
        Iterator<DataPoint> it = requiredDataPoints.iterator();
        int i = 0;
        while (it.hasNext()) {
            DataPoint pnt = ((DataPoint) it.next());
            logger.info(data.get(i).time + "," + data.get(i).value + "," + pnt.getDependentValue());
            sequence.set(i, (new Entry(data.get(i).time, (float) pnt.getDependentValue())));
            i++;
        }
    }

    public void toJson(JSONStringer json_out) {

    }

    public void fromJson(JSONObject json_obj) {

    }
}
