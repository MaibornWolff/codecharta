package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public interface ModificationMetric<T extends Number> extends Metric<T> {
    void registerModification(Modification modification);
}
