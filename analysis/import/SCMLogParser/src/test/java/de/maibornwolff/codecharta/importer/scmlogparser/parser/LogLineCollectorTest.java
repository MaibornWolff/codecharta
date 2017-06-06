package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import org.junit.Test;

import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Stream;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class LogLineCollectorTest {

    @Test
    public void collectsBetweenSeparators() {
        Stream<String> logLines = Stream.of("##", "commit 1", "##", "commit 2");
        Collector<String, ?, Stream<List<String>>> collector = LogLineCollector.create(logLine -> logLine.equals("##"));
        Stream<List<String>> commits = logLines.collect(collector);
        assertThat(commits).containsExactly(singletonList("commit 1"), singletonList("commit 2"));
    }

    @Test
    public void raisesExceptionWhenNoCommitSeparatorPresent() {
        Stream<String> logLines = Stream.of("commit 1", "commit 2");
        Predicate<String> commitSeparatorTest = logLine -> logLine.equals("some commit separator");
        assertThatThrownBy(() -> logLines.collect(LogLineCollector.create(commitSeparatorTest))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void skipsEmptyLines() {
        Stream<String> logLinesWithEmptyOneInTheMiddle = Stream.of("--", "commit data", "", "commit comment", "--");
        Collector<String, ?, Stream<List<String>>> collector = LogLineCollector.create(string -> string.equals("--"));
        Stream<List<String>> commits = logLinesWithEmptyOneInTheMiddle.collect(collector);
        assertThat(commits).hasSize(1);
    }

    @Test
    public void doesNotSupportParallelStreams() {
        Stream<String> logLines = Stream.of("--", "commit 1").parallel();
        Collector<String, ?, Stream<List<String>>> collector = LogLineCollector.create(logLine -> logLine.equals("--"));
        assertThatThrownBy(() -> logLines.collect(collector)).isInstanceOf(IllegalArgumentException.class);
    }
}
