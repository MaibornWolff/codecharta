package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.Map;

/**
 * this is only an approximation of the correct code churn.
 */
public final class CodeChurn implements Metric {
    private long loc = 0;
    private long accumulatedNumberOfLinesAdded = 0;
    private long accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String metricName() {
        return "code_churn";
    }

    @Override
    public Map<String, Number> value() {
        return ImmutableMap.of("abs_code_churn", absoluteCodeChurn(),
                "rel_code_churn", relativeCodeChurn(),
                "loc", loc());
    }


    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
        loc += modification.getAdditions();
        loc -= modification.getDeletions();
    }

    /**
     * this is only an approximation of the correct file size.
     * correct only if e.g. --numstat -m --first-parent ist given.
     */
    public Long loc() {
        return loc >= 0 ? loc : 0;
    }

    public Long absoluteCodeChurn() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }


    public Double relativeCodeChurn() {
        double relativeChurn;

        if (loc() > 0) {
            relativeChurn = (absoluteCodeChurn().doubleValue() / loc().doubleValue()) * 100d;
        } else {
            relativeChurn = 0d;
        }

        return relativeChurn;
    }
}
