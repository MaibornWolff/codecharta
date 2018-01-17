package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

/**
 * this is only an approximation of the correct file size.
 * correct only if e.g. --numstat -m --first-parent ist given.
 */
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
        return loc >= 0 ? loc : 0;
    }
}
