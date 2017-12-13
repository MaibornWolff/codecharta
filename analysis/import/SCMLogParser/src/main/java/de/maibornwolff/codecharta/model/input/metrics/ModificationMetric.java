package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Modification;

public interface ModificationMetric<T extends Number> {
    String metricName();

    void registerModification(Modification modification);

    T value();
}
