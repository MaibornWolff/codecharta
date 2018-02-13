package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.TreeSet;

public class RangeOfWeeksWithCommits implements Metric {

    private final TreeSet<CalendarWeek> weeksWithCommits = new TreeSet<>();

    @Override
    public String description() {
        return "Range Of Weeks With Commits: Range in Weeks between first and last commit of this file.";
    }

    @Override
    public String metricName() {
        return "range_of_weeks_with_commits";
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    @Override
    public Number value() {
        if (weeksWithCommits.size() < 1) {
            return 0;
        }

        return 1 + CalendarWeek.numberOfWeeksBetween(weeksWithCommits.last(), weeksWithCommits.first());
    }
}
