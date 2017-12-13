package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Modification;

public interface ModificationMetric<T extends Number> extends Metric<T> {
    void registerModification(Modification modification);
}
