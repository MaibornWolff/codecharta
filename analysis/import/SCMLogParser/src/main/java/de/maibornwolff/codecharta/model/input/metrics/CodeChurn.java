package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Modification;

public final class CodeChurn implements ModificationMetric<Integer> {
    public static final String NUMBER_OF_COMMITS = "code_churn";

    private int accumulatedNumberOfLinesAdded = 0;
    private int accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String metricName() {
        return NUMBER_OF_COMMITS;
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
