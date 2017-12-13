package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Modification;

public final class NumberOfOccurencesInCommits implements ModificationMetric<Integer> {
    public static final String NUMBER_OF_COMMITS = "number_of_commits";

    private int numberOfOccurrencesInCommits = 0;

    @Override
    public String metricName() {
        return NUMBER_OF_COMMITS;
    }

    @Override
    public void registerModification(Modification modification) {
        numberOfOccurrencesInCommits++;
    }

    @Override
    public Integer value() {
        return numberOfOccurrencesInCommits;
    }
}
