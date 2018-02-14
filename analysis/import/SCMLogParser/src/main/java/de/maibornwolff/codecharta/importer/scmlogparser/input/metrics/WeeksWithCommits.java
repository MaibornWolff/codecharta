package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.TreeSet;

public class WeeksWithCommits implements Metric {

    private final TreeSet<CalendarWeek> weeksWithCommits = new TreeSet<>();

    @Override
    public String description() {
        return "Weeks With Commits: number of weeks with commits for this file.";
    }

    @Override
    public String metricName() {
        return "weeks_with_commits";
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    @Override
    public Number value() {
        return weeksWithCommits.size();
    }
}
