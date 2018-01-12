package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Commit;

public interface CommitMetric<T extends Number> extends Metric<T> {
    void registerCommit(Commit commit);
}
