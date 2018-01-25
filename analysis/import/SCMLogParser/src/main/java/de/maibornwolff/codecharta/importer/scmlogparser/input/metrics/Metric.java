package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.Map;

public interface Metric {

    String metricName();

    Map<String, Number> value();

    default void registerModification(Modification modification) {
        // defaults to: do nothing
    }

    default void registerCommit(Commit commit) {
        // defaults to: do nothing
    }

    default Number value(String name) {
        return value().get(name);
    }
}
