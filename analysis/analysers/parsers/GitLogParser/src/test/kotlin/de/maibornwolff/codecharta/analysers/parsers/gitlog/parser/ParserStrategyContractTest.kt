package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.data.TemporalUnitLessThanOffset
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.util.stream.Stream

abstract class ParserStrategyContractTest {
    private val metricsFactory = MetricsFactory()

    protected abstract val fullCommit: List<String>

    protected abstract val logParserStrategy: LogParserStrategy

    protected abstract val twoCommitsAsStream: Stream<String>

    @Test
    fun parsesCommit() {
        val parser = LogLineParser(logParserStrategy, metricsFactory)
        val commit = parser.parseCommit(fullCommit)
        assertThat(commit).extracting(
            java.util.function.Function<Commit, Any> { it.author },
            java.util.function.Function<Commit, Any> { it.commitDate }
        )
            .containsExactly("TheAuthor", OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET))
        assertThat(commit.fileNameList).containsExactlyInAnyOrder(
            "src/Added.java",
            "src/Modified.java",
            "src/Deleted.java"
        )
    }

    @Test
    fun parsesFilesInCommitLines() {
        val modifications = logParserStrategy.parseModifications(fullCommit)
        assertThat(modifications).hasSize(3)
        assertThat(modifications).extracting<String, RuntimeException> { it.currentFilename }
            .containsExactlyInAnyOrder("src/Added.java", "src/Modified.java", "src/Deleted.java")
    }

    @Test
    fun parseAuthorFromCommitLines() {
        val author = logParserStrategy.parseAuthor(fullCommit)
        assertThat(author).isEqualTo("TheAuthor")
    }

    @Test
    fun parseDateFromCommitLines() {
        val commitDate = logParserStrategy.parseDate(fullCommit)

        val expectedDate = OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET)
        val precision = TemporalUnitLessThanOffset(1, ChronoUnit.MILLIS)

        assertThat(commitDate).isCloseTo(expectedDate, precision)
    }

    @Test
    @Throws(Exception::class)
    fun canProvidesAnAppropriateLogLineCollectorToSeparateCommits() {
        val commits = twoCommitsAsStream.collect(logParserStrategy.createLogLineCollector())
        assertThat(commits).hasSize(2)
    }

    companion object {
        private val ZONE_OFFSET = ZoneOffset.ofHours(2)
    }
}
