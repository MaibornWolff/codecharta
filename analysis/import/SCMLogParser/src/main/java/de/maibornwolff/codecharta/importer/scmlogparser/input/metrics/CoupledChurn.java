package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/*
 * experimental -> therefore no tests
 */
public class CoupledChurn implements Metric {
    private long coupledChurn = 0;
    private long ownChurn = 0;
    private long numberOfCommits = 0;

    @Override
    public String description() {
        return "Coupled Churn: Expected number of coupled lines changed with every commit.";
    }

    @Override
    public String metricName() {
        return "coupled_churn";
    }

    @Override
    public Number value() {
        return numberOfCommits > 0 ? 100 * (coupledChurn - ownChurn) / numberOfCommits : 0;
    }

    @Override
    public void registerCommit(Commit commit) {
        long commitsCoupledChurn = commit.getModifications().stream()
                .map(mod -> (long) (mod.getAdditions() + mod.getDeletions()))
                .mapToLong(Long::longValue)
                .sum();

        if (commitsCoupledChurn > 0) {
            numberOfCommits++;
            coupledChurn += commitsCoupledChurn;
        }
    }

    @Override
    public void registerModification(Modification modification) {
        ownChurn += modification.getAdditions() + modification.getDeletions();
    }
}
