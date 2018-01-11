package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public final class NumberOfOccurencesInCommits implements ModificationMetric<Integer> {
    private int numberOfOccurrencesInCommits = 0;

    @Override
    public String metricName() {
        return "number_of_commits";
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
