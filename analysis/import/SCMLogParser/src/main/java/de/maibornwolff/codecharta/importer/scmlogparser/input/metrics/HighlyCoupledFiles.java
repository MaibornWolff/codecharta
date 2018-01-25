package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.HashMap;
import java.util.Map;

/*
 * experimental -> therefore no tests
 */
public class HighlyCoupledFiles implements Metric {
    public static final double HIGH_COUPLING_VALUE = .35;
    public static final long MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L;

    private final Map<String, Long> simultaneouslyCommitedFiles = new HashMap<>();
    private long numberOfCommits = 0;

    @Override
    public String description() {
        return "Highly Coupled Files: Number of highly coupled files with this file.";
    }

    @Override
    public String metricName() {
        return "highly_coupled_files";
    }

    @Override
    public Number value() {
        return simultaneouslyCommitedFiles.values().stream()
                .filter(this::isHighlyCoupled)
                .count();
    }

    private boolean isHighlyCoupled(long val) {
        if (numberOfCommits > MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
            return (double) val / (double) numberOfCommits > HIGH_COUPLING_VALUE;
        }

        return false;
    }

    @Override
    public void registerCommit(Commit commit) {
        numberOfCommits++;
        commit.getModifications()
                .forEach(
                        mod -> simultaneouslyCommitedFiles.merge(mod.getFilename(), 1L, (x, y) -> x + y)
                );
    }
}
