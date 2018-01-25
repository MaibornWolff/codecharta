package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public final class NumberOfOccurencesInCommits implements Metric {
    private long numberOfOccurrencesInCommits = 0;

    @Override
    public String metricName() {
        return "number_of_commits";
    }

    @Override
    public void registerModification(Modification modification) {
        numberOfOccurrencesInCommits++;
    }

    @Override
    public Number value() {
        return numberOfOccurrencesInCommits;
    }
}
