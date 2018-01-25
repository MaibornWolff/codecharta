package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/**
 * this is only an approximation of the correct code churn.
 */
public final class RelativeCodeChurn implements Metric {
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

    /**
     * this is only an approximation of the correct file size.
     * correct only if e.g. --numstat -m --first-parent ist given.
     */
    private Long loc() {
        long loc = accumulatedNumberOfLinesAdded - accumulatedNumberOfLinesDeleted;
        return loc >= 0 ? loc : 0;
    }

    private Long absoluteCodeChurn() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }

    @Override
    public Number value() {
        long relativeChurn;

        if (loc() > 0) {
            relativeChurn = (100 * absoluteCodeChurn() / loc());
        } else {
            relativeChurn = 0;
        }

        return relativeChurn;
    }
}
