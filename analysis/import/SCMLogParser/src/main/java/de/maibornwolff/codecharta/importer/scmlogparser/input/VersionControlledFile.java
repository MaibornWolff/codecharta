package de.maibornwolff.codecharta.importer.scmlogparser.input;

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.CommitMetric;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.ModificationMetric;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class VersionControlledFile {

    // actual filename
    private final String actualFilename;
    private final Set<String> authors = new HashSet<>();
    private final List<ModificationMetric> modificationMetrics;
    private final List<CommitMetric> commitMetrics;

    // current filename in a specific revision, might change in history
    private String filename;
    private boolean markedDeleted = false;

    public VersionControlledFile(String filename, MetricsFactory metricsFactory) {
        this(filename, metricsFactory.createModificationMetrics(), metricsFactory.createCommitMetrics());
    }

    VersionControlledFile(
            String filename,
            List<ModificationMetric> modificationMetrics,
            List<CommitMetric> commitMetrics
    ) {
        this.filename = filename;
        this.actualFilename = filename;
        this.modificationMetrics = modificationMetrics;
        this.commitMetrics = commitMetrics;
    }

    /**
     * registers commits in anti-chronological order
     *
     */
    public void registerCommit(Commit commit) {
        Optional<Modification> modification = commit.getModification(filename);

        if (modification.isPresent()) {
            commitMetrics.forEach(m -> m.registerCommit(commit));
            authors.add(commit.getAuthor());

            registerModification(modification.get());
        }
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
        modificationMetrics.forEach(m -> m.registerModification(modification));
    }

    private Stream<Metric> getMetrics() {
        return Stream.of(modificationMetrics, commitMetrics)
                .flatMap(Collection::stream);
    }

    public boolean markedDeleted() {
        return markedDeleted;
    }

    public Map<String, Number> getMetricsMap() {
        return getMetrics().collect(Collectors.toMap(Metric::metricName, Metric::value));
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

    public int getMetricValue(String metricName) {
        return getMetrics()
                .filter(m -> m.metricName().equals(metricName)).findAny()
                .orElseThrow(() -> new RuntimeException("metric " + metricName + " not found."))
                .value().intValue();
    }

    public String getActualFilename() {
        return actualFilename;
    }
}
