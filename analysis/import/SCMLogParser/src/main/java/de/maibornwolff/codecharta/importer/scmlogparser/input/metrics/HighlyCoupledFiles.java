package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.HashMap;
import java.util.Map;

public class HighlyCoupledFiles implements Metric {
    private static final double HIGH_COUPLING_VALUE = .35;
    private static final long MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L;

    private final Map<String, Long> simultaneouslyCommitedFiles = new HashMap<>();
    private long numberOfCommits = 0;

    @Override
    public String description() {
        return "Highly Coupled Files: Number of highly coupled files (35% times modified the same time) with this file.";
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
        if (numberOfCommits >= MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
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

    @Override
    public void registerModification(Modification modification) {
        // delete this file
        simultaneouslyCommitedFiles.remove(modification.getFilename());
    }
}
