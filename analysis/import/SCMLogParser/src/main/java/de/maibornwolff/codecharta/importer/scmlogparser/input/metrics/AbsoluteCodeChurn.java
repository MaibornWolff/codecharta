package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public class AbsoluteCodeChurn implements Metric {
    private long accumulatedNumberOfLinesAdded = 0;
    private long accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String description() {
        return "Absolute Code Churn: Sum of number of added and deleted lines of all commits for this file.";
    }

    @Override
    public String metricName() {
        return "abs_code_churn";
    }

    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
    }

    @Override
    public Number value() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }
}
