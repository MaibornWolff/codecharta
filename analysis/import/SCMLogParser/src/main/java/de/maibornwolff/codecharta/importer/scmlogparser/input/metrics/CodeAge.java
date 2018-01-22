package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.Map;
import java.util.TreeSet;

public final class CodeAge implements Metric {

    private final TreeSet<CalendarWeek> weeksWithCommits = new TreeSet<>();

    @Override
    public String metricName() {
        return "code_age";
    }

    @Override
    public Map<String, Number> value() {
        return ImmutableMap.of(
                "avg_commit_frequency", avgCommitFrequency()
        );
    }

    @Override
    public void registerCommit(Commit commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    private long commitDateSpan() {
        if (weeksWithCommits.size() < 1) {
            return 0;
        }

        return 1 + CalendarWeek.numberOfWeeksBetween(weeksWithCommits.last(), weeksWithCommits.first());
    }

    private int numberOfWeeksWithCommit() {
        return weeksWithCommits.size();
    }

    private double avgCommitFrequency() {
        long span = commitDateSpan();
        return span > 0 ? (double) numberOfWeeksWithCommit() / (double) span : 1d;
    }
}