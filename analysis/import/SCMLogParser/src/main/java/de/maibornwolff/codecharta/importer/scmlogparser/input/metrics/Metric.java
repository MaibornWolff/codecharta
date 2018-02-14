package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public interface Metric {

    String description();

    String metricName();

    Number value();

    default void registerModification(Modification modification) {
        // defaults to: do nothing
    }

    default void registerCommit(Commit commit) {
        // defaults to: do nothing
    }
}
