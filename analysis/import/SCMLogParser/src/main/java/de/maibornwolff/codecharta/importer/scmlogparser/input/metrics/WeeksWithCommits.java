package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.Map;
import java.util.TreeSet;

public final class WeeksWithCommits implements Metric {

    private final TreeSet<CalendarWeek> weeksWithCommits = new TreeSet<>();

    @Override
    public String metricName() {
        return "weeks_with_commits";
    }

    @Override
    public Map<String, Number> value() {
        return ImmutableMap.of(
                "weeks_with_commits", weeksWithCommits(),
                "range_of_weeks_with_commits", rangeOfWeeksWithCommits(),
                "successive_weeks_of_commits", successiveWeeksOfCommits()
        );
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    int weeksWithCommits() {
        return weeksWithCommits.size();
    }

    long rangeOfWeeksWithCommits() {
        if (weeksWithCommits.size() < 1) {
            return 0;
        }

        return 1 + CalendarWeek.numberOfWeeksBetween(weeksWithCommits.last(), weeksWithCommits.first());
    }

    int successiveWeeksOfCommits() {
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
