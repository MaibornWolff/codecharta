package de.maibornwolff.codecharta.importer.scmlogparser.input;

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metrics;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;

import java.util.*;

public class VersionControlledFile {

    // actual filename
    private final String actualFilename;
    private final Set<String> authors = new HashSet<>();
    private final Metric rootMetric;

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
        rootMetric = Metrics.of(metrics);
    }

    /**
     * registers commits in anti-chronological order
     */
    public void registerCommit(Commit commit) {
        Optional<Modification> modification = commit.getModification(filename);

        modification.ifPresent(mod -> {
            rootMetric.registerCommit(commit);
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
        rootMetric.registerModification(modification);
    }

    public boolean markedDeleted() {
        return markedDeleted;
    }

    public Map<String, ? extends Number> getMetricsMap() {
        return rootMetric.value();
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
        return rootMetric.value(metricName);
    }

    public String getActualFilename() {
        return actualFilename;
    }
}
