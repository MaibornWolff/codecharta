package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Commit;

import java.util.HashSet;
import java.util.Set;

public final class NumberOfAuthors implements CommitMetric<Integer> {
    public static final String NUMBER_OF_AUTHORS = "number_of_authors";

    private final Set<String> authors = new HashSet<>();

    @Override
    public String metricName() {
        return NUMBER_OF_AUTHORS;
    }

    @Override
    public void registerCommit(Commit commit) {
        authors.add(commit.getAuthor());
    }

    @Override
    public Integer value() {
        return authors.size();
    }
}
