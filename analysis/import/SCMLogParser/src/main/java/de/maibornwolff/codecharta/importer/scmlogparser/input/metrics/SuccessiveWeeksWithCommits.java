package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.TreeSet;

public class SuccessiveWeeksWithCommits implements Metric {

    private final TreeSet<CalendarWeek> weeksWithCommits = new TreeSet<>();

    @Override
    public String description() {
        return "Successive Weeks With Commits: maximal number of successive weeks with commits.";
    }

    @Override
    public String metricName() {
        return "successive_weeks_with_commits";
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    @Override
    public Number value() {
        int numberOfSuccessiveWeeks = 0;

        int temp = 0;
        CalendarWeek lastKwWithCommit = null;
        for (CalendarWeek kw : weeksWithCommits) {
            if (lastKwWithCommit == null || CalendarWeek.numberOfWeeksBetween(kw, lastKwWithCommit) == 1) {
                temp++;
            } else {
                temp = 1;
            }
            lastKwWithCommit = kw;
            numberOfSuccessiveWeeks = temp > numberOfSuccessiveWeeks ? temp : numberOfSuccessiveWeeks;
        }

        return numberOfSuccessiveWeeks;
    }
}
