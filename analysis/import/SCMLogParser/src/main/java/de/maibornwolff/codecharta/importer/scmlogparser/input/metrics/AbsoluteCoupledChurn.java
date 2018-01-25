package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/*
 * experimental -> therefore no tests
 */
public class AbsoluteCoupledChurn implements Metric {
    private long coupledChurn = 0;

    @Override
    public String description() {
        return "Absolute Coupled Churn: Total number of lines changed in all files when this file was commited.";
    }

    @Override
    public String metricName() {
        return "abs_coupled_churn";
    }

    @Override
    public Number value() {
        return coupledChurn;
    }

    @Override
    public void registerCommit(Commit commit) {
        commit.getModifications()
                .forEach(this::addToCoupledChurn);
    }

    private void addToCoupledChurn(Modification modification) {
        coupledChurn += modification.getAdditions() + modification.getDeletions();
    }
}
