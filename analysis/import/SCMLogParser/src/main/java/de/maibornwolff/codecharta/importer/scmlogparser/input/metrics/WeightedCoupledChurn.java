package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.HashMap;
import java.util.Map;

/*
 * experimental -> therefore no tests
 */
public class WeightedCoupledChurn implements Metric {
    private final Map<String, RelativeFileMetric> simultaneouslyCommitedFiles = new HashMap<>();
    private long numberOfCommits = 0;

    @Override
    public String description() {
        return "Weighted Coupled Churn: Averaged number of lines changed in other files when this file was commited.";
    }

    @Override
    public String metricName() {
        return "weighted_coupled_churn";
    }

    /**
     * @return expected coupled churn when the given file is modified
     */
    @Override
    public Number value() {
        return (long) simultaneouslyCommitedFiles.values().stream()
                .map(m -> (double) m.churn * (double) m.numberOfCommits / (double) numberOfCommits)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    @Override
    public void registerCommit(Commit commit) {
        numberOfCommits++;
        commit.getModifications()
                .forEach(
                        mod -> {
                            if (!simultaneouslyCommitedFiles.containsKey(mod.getFilename())) {
                                simultaneouslyCommitedFiles.put(mod.getFilename(), new RelativeFileMetric());
                            }
                            simultaneouslyCommitedFiles.get(mod.getFilename()).registerModification(mod);
                        }
                );
    }

    @Override
    public void registerModification(Modification modification) {
        // delete own churn
        simultaneouslyCommitedFiles.remove(modification.getFilename());
    }

    private static class RelativeFileMetric {
        private long numberOfCommits = 0;
        private long churn = 0;

        private void registerModification(Modification mod) {
            numberOfCommits++;
            churn += mod.getAdditions() + mod.getDeletions();
        }
    }

}
