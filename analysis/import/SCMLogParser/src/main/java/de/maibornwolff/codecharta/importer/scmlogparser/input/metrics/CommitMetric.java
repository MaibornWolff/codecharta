package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

public interface CommitMetric<T extends Number> extends Metric<T> {
    void registerCommit(Commit commit);
}
