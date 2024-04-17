package de.maibornwolff.codecharta.importer.gitlogparser.parser

import de.maibornwolff.codecharta.importer.gitlogparser.input.Commit
import de.maibornwolff.codecharta.importer.gitlogparser.input.metrics.MetricsFactory
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
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
                java.util.function.Function<Commit, Any> { it.commitDate },
                                     )
                .containsExactly("TheAuthor", OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET))
        assertThat(commit.fileNameList).containsExactlyInAnyOrder(
                "src/Added.java", "src/Modified.java",
                "src/Deleted.java",
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
        assertThat(commitDate).isEqualToIgnoringNanos(OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET))
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
