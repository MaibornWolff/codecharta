package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MetricsFactory {

    private final List<String> metricNames;

    public MetricsFactory() {
        this.metricNames = Stream.concat(createAllModificationMetrics().stream(), createAllCommitMetrics().stream())
                .map(Metric::metricName)
                .collect(Collectors.toList());
    }

    public MetricsFactory(List<String> metricNames) {
        this.metricNames = metricNames;
    }

    private List<ModificationMetric> createAllModificationMetrics() {
        return Arrays.asList(
                new NumberOfOccurencesInCommits(),
                new CodeChurn(),
                new LinesOfCode()
        );
    }

    private List<CommitMetric> createAllCommitMetrics() {
        return Arrays.asList(
                new NumberOfWeeksWithCommit(),
                new NumberOfAuthors()
        );
    }

    public List<ModificationMetric> createModificationMetrics() {
        return createAllModificationMetrics().stream()
                .filter(m -> metricNames.contains(m.metricName()))
                .collect(Collectors.toList());
    }

    public List<CommitMetric> createCommitMetrics() {
        return createAllCommitMetrics().stream()
                .filter(m -> metricNames.contains(m.metricName()))
                .collect(Collectors.toList());
    }
}
