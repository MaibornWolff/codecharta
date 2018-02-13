package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.HashSet;
import java.util.Set;

public class NumberOfAuthors implements Metric {
    private final Set<String> authors = new HashSet<>();

    @Override
    public String description() {
        return "Number of Authors: Number of authors that contributed to this file.";
    }

    @Override
    public String metricName() {
        return "number_of_authors";
    }

    @Override
    public void registerCommit(Commit commit) {
        authors.add(commit.getAuthor());
    }

    @Override
    public Number value() {
        return authors.size();
    }
}
