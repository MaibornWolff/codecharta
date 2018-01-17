package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/**
 * this is only an approximation of the correct code churn in perCent.
 */
public final class RelativeCodeChurn implements ModificationMetric<Double> {
    private long loc = 0;
    private int accumulatedNumberOfLinesAdded = 0;
    private int accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String metricName() {
        return "rel_code_churn";
    }

    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
        loc += modification.getAdditions();
        loc -= modification.getDeletions();
    }

    @Override
    public Double value() {
        double absoluteChurn = accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
        double relativeChurn;

        if (loc > 0) {
            relativeChurn = (absoluteChurn / loc) * 100d;
        } else {
            relativeChurn = 0d;
        }

        return relativeChurn;
    }
}
