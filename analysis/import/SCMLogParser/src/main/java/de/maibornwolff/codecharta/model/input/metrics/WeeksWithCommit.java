package de.maibornwolff.codecharta.model.input.metrics;

import de.maibornwolff.codecharta.model.input.Commit;

import java.util.HashSet;
import java.util.Set;

public final class WeeksWithCommit implements CommitMetric<Integer> {
    public static final String WEEKS_WITH_COMMITS = "weeks_with_commits";

    private final Set<CalendarWeek> weeksWithCommits = new HashSet<>();

    @Override
    public String metricName() {
        return WEEKS_WITH_COMMITS;
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
