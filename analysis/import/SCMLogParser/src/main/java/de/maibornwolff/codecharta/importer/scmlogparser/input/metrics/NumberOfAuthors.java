package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class NumberOfAuthors implements Metric {
    private final Set<String> authors = new HashSet<>();

    @Override
    public String metricName() {
        return "number_of_authors";
    }

    @Override
    public Map<String, Number> value() {
        return Collections.singletonMap(metricName(), singleValue());
    }

    @Override
    public void registerCommit(Commit commit) {
        authors.add(commit.getAuthor());
    }


    public Integer singleValue() {
        return authors.size();
    }
}
