package de.maibornwolff.codecharta.importer.scmlogparser.input;

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;

import java.util.*;
import java.util.stream.Collectors;

public class VersionControlledFile {

    // actual filename
    private final String actualFilename;
    private final Set<String> authors = new HashSet<>();
    private final List<Metric> metrics;

    // current filename in a specific revision, might change in history
    private String filename;
    private boolean markedDeleted = false;

    public VersionControlledFile(String filename, MetricsFactory metricsFactory) {
        this(filename, metricsFactory.createMetrics());
    }

    VersionControlledFile(
            String filename,
            Metric... metrics
    ) {
        this(filename, Arrays.asList(metrics));
    }

    VersionControlledFile(
            String filename,
            List<Metric> metrics
    ) {
        this.filename = filename;
        this.actualFilename = filename;
        this.metrics = metrics;
    }

    /**
     * registers commits in anti-chronological order
     */
    public void registerCommit(Commit commit) {
        Optional<Modification> modification = commit.getModification(filename);

        modification.ifPresent(mod -> {
            metrics.forEach(metric -> metric.registerCommit(commit));
            authors.add(commit.getAuthor());

            registerModification(mod);
        });
    }

    private void registerModification(Modification modification) {
        Modification.Type type = modification.getType();
        switch (type) {
            case DELETE:
                markedDeleted = true;
                break;
            case RENAME:
                filename = modification.getOldFilename();
                break;
            default:
                break;
        }
        metrics.forEach(metric -> metric.registerModification(modification));
    }

    public boolean markedDeleted() {
        return markedDeleted;
    }

    public Map<String, ? extends Number> getMetricsMap() {
        return metrics.stream()
                .collect(Collectors.toMap(Metric::metricName, Metric::value));
    }

    public String getFilename() {
        return filename;
    }

    public Set<String> getAuthors() {
        return authors;
    }

    @Override
    public String toString() {
        return getActualFilename() + " with metrics " + getMetricsMap();
    }

    public Number getMetricValue(String metricName) {
        return metrics.stream()
                .filter(m -> m.metricName().equals(metricName))
                .findFirst()
                .map(Metric::value)
                .orElseThrow(() -> new RuntimeException("metric " + metricName + " not found."));
    }

    public String getActualFilename() {
        return actualFilename;
    }
}
