package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public class AbsoluteCoupledChurn implements Metric {
    private long totalChurn = 0;
    private long ownChurn = 0;

    @Override
    public String description() {
        return "Absolute Coupled Churn: Total number of lines changed in all other files when this file was commited.";
    }

    @Override
    public String metricName() {
        return "abs_coupled_churn";
    }

    @Override
    public Number value() {
        return totalChurn - ownChurn;
    }

    @Override
    public void registerCommit(Commit commit) {
        long commitsTotalChurn = commit.getModifications().stream()
                .map(mod -> (long) (mod.getAdditions() + mod.getDeletions()))
                .mapToLong(Long::longValue)
                .sum();

        if (commitsTotalChurn > 0) {
            totalChurn += commitsTotalChurn;
        }
    }

    @Override
    public void registerModification(Modification modification) {
        ownChurn += modification.getAdditions() + modification.getDeletions();
    }
}
