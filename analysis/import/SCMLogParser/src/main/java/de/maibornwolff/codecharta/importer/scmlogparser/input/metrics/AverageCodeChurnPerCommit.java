package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

public class AverageCodeChurnPerCommit implements Metric {
    private long absoluteCodeChurn = 0;
    private long numberOfNontrivialCommits = 0;

    @Override
    public String description() {
        return "Average Code Churn: Average code churn per commit of this file.";
    }

    @Override
    public String metricName() {
        return "avg_code_churn";
    }

    @Override
    public void registerModification(Modification modification) {
        int commitsCodeChurn = modification.getAdditions() + modification.getDeletions();
        if (commitsCodeChurn > 0) {
            numberOfNontrivialCommits++;
            this.absoluteCodeChurn += commitsCodeChurn;
        }
    }

    private long absoluteCodeChurn() {
        return absoluteCodeChurn;
    }

    @Override
    public Number value() {
        return numberOfNontrivialCommits > 0 ? absoluteCodeChurn() / numberOfNontrivialCommits : 0;
    }
}
