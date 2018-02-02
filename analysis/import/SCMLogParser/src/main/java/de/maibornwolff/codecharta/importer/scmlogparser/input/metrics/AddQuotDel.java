package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public class AddQuotDel implements Metric {
    private long accumulatedNumberOfLinesAdded = 0;
    private long accumulatedNumberOfLinesDeleted = 0;

    @Override
    public String description() {
        return "Relative Code Churn: Quotient of addition churn and deletion churn.";
    }

    @Override
    public String metricName() {
        return "add_quot_deletion";
    }

    @Override
    public Number value() {
        if (accumulatedNumberOfLinesDeleted > 0) {
            return 100 * accumulatedNumberOfLinesAdded / accumulatedNumberOfLinesDeleted;
        }
        return 100 * accumulatedNumberOfLinesAdded;
    }

    @Override
    public void registerModification(Modification modification) {
        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
    }
}
