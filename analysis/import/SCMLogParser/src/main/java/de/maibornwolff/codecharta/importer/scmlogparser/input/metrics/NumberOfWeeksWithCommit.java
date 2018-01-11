package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.HashSet;
import java.util.Set;

public final class NumberOfWeeksWithCommit implements CommitMetric<Integer> {
    private final Set<CalendarWeek> weeksWithCommits = new HashSet<>();

    @Override
    public String metricName() {
        return "weeks_with_commits";
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    @Override
    public Integer value() {
        return weeksWithCommits.size();
    }
}
