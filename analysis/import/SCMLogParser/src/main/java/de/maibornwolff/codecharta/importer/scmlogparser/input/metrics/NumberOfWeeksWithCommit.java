package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class NumberOfWeeksWithCommit implements Metric {

    private final Set<CalendarWeek> weeksWithCommits = new HashSet<>();

    @Override
    public String metricName() {
        return "weeks_with_commits";
    }

    @Override
    public Map<String, Number> value() {
        return Collections.singletonMap("weeks_with_commits", numberOfWeeksWithCommit());
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    int numberOfWeeksWithCommit() {
        return weeksWithCommits.size();
    }
}
