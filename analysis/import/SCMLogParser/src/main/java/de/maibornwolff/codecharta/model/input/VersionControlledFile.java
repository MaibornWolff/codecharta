package de.maibornwolff.codecharta.model.input;

import de.maibornwolff.codecharta.model.input.metrics.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class VersionControlledFile {

    private final String filename;
    private final Set<String> authors;
    private final List<ModificationMetric> modificationMetrics = createModificationMetrics();
    private final List<CommitMetric> commitMetrics = createCommitMetrics();

    public VersionControlledFile(String filename) {
        this.filename = filename;
        this.authors = new HashSet<>();
    }

    private static List<ModificationMetric> createModificationMetrics() {
        return Collections.singletonList(
                new NumberOfOccurencesInCommits()
        );
    }

    private static List<CommitMetric> createCommitMetrics() {
        return Arrays.asList(
                new WeeksWithCommit(),
                new NumberOfAuthors()
        );
    }

    public void registerCommit(Commit commit) {
        Optional<Modification> modification = commit.getModification(filename);
        if (modification.isPresent()) {
            modificationMetrics.forEach(m -> m.registerModification(modification.get()));
            commitMetrics.forEach(m -> m.registerCommit(commit));
            authors.add(commit.getAuthor());
        }
    }

    public List<Metric> getMetrics() {
        return Stream.of(modificationMetrics, commitMetrics)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    public Map<String, Number> getMetricsMap() {
        return getMetrics().stream().collect(Collectors.toMap(Metric::metricName, Metric::value));
    }

    public String getFilename() {
        return filename;
    }

    public Set<String> getAuthors() {
        return authors;
    }

    @Override
    public String toString() {
        return filename + " with metrics " + getMetricsMap();
    }

    public int getMetricValue(String metricName) {
        return getMetrics().stream()
                .filter(m -> m.metricName().equals(metricName)).findAny()
                .orElseThrow(() -> new RuntimeException("metric " + metricName + " not found."))
                .value().intValue();
    }
}
