package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/**
 * this is only an approximation of the correct code churn.
 */
public class RelativeCodeChurn implements Metric {
    private long accumulatedNumberOfLinesAdded = 0;
    private long accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String description() {
        return "Relative Code Churn: Approximation for the quotient of absolute code churn and loc.";
    }

    @Override
    public String metricName() {
        return "rel_code_churn";
    }

    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
    }

    private long loc() {
        long loc = accumulatedNumberOfLinesAdded - accumulatedNumberOfLinesDeleted;
        return loc >= 0 ? loc : 0;
    }

    private long absoluteCodeChurn() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }

    /**
     * @return codeChurn weighted by the maximal number of lines
     */
    @Override
    public Number value() {
        long relativeChurn;

        if (loc() > 0) {
            relativeChurn = absoluteCodeChurn() * 100 / loc();
        } else {
            relativeChurn = 0;
        }

        return relativeChurn;
    }
}
