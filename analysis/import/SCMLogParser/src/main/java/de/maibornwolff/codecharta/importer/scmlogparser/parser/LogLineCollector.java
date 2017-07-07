package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Stream;

class LogLineCollector {

    private final Predicate<String> isCommitSeparator;

    private LogLineCollector(Predicate<String> isCommitSeparator) {
        this.isCommitSeparator = isCommitSeparator;
    }

    static Collector<String, ?, Stream<List<String>>> create(Predicate<String> commitSeparatorTest) {
        LogLineCollector collector = new LogLineCollector(commitSeparatorTest);
        return Collector.of(ArrayList::new, collector::collectLogLine, collector::combineForParallelExecution, collector::removeIncompleteCommits);
    }

    private void collectLogLine(List<List<String>> commits, String logLine) {
        if (isCommitSeparator.test(logLine)) {
            startNewCommit(commits);
        } else {
            assertOneCommitIsPresent(commits);
            addToLastCommit(commits, logLine);
        }
    }

    private void startNewCommit(List<List<String>> commits) {
        commits.add(new ArrayList<>());
    }

    private void assertOneCommitIsPresent(List<List<String>> commits) {
        if (commits.isEmpty()) {
            throw new IllegalArgumentException("no commit present or parallel stream of log lines, which is not supported");
        }
    }

    private void addToLastCommit(List<List<String>> commits, String logLine) {
        int indexOfLastCommit = commits.size() - 1;
        List<String> lastCommit = commits.get(indexOfLastCommit);
        lastCommit.add(logLine);
    }

    private List<List<String>> combineForParallelExecution(List<List<String>> firstList, List<List<String>> secondList) {
        throw new UnsupportedOperationException("parallel collection of log lines not supported");
    }

    private Stream<List<String>> removeIncompleteCommits(List<List<String>> commits) {
        return commits.stream().filter(commit -> !commit.isEmpty());
    }

}
