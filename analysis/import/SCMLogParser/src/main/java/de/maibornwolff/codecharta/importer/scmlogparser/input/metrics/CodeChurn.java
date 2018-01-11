package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public final class CodeChurn implements ModificationMetric<Integer> {
    private int accumulatedNumberOfLinesAdded = 0;
    private int accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String metricName() {
        return "code_churn";
    }

    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
    }

    @Override
    public Integer value() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }
}
