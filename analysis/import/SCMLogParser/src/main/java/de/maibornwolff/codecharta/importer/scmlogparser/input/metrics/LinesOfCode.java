package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public final class LinesOfCode implements ModificationMetric<Long> {
    private long loc = 0;

    @Override
    public String metricName() {
        return "loc";
    }

    @Override
    public void registerModification(Modification modification) {
        loc += modification.getAdditions();
        loc -= modification.getDeletions();
    }

    @Override
    public Long value() {
        return loc;
    }
}
