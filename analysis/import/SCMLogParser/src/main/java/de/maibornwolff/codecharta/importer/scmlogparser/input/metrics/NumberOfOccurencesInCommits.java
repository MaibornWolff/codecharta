package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.Collections;
import java.util.Map;

public final class NumberOfOccurencesInCommits implements Metric {
    private long numberOfOccurrencesInCommits = 0;

    @Override
    public String metricName() {
        return "number_of_commits";
    }

    @Override
    public Map<String, Number> value() {
        return Collections.singletonMap(metricName(), singleValue());
    }


    @Override
    public void registerModification(Modification modification) {
        numberOfOccurrencesInCommits++;
    }

    public Long singleValue() {
        return numberOfOccurrencesInCommits;
    }
}
