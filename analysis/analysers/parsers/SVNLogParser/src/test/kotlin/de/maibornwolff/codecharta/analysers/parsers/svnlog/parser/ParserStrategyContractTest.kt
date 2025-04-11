package de.maibornwolff.codecharta.analysers.parsers.svnlog.parser

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.VersionControlledFile
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.assertj.core.api.Assertions.within
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.util.stream.Stream

abstract class ParserStrategyContractTest {
    private val metricsFactory = MetricsFactory()

    /**
     * This method should return test data for the contract test. <br></br><br></br>
     * Must return a List of String representing a normal/default commit of the underlying SCM System
     * We assume that a commit can be represented as a list of Strings containing all necessary
     * informations a LogParserStrategy can extract.<br></br>
     * The test data set should contain a parsable author "TheAuthor", a parsable date with the
     * offsetDateTime "OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET)" (Tue May 9 19:57:57 2017 +2:00) and three files of the commit
     * whereby one filename is duplicated; "src/Main.java","src/Main.java","src/Util.java"
     *
     * @return the test data as a List<String>
     * </String> */
    protected abstract val fullCommit: List<String>

    protected abstract val logParserStrategy: LogParserStrategy

    protected abstract val twoCommitsAsStream: Stream<String>

    @Test
    fun `parses commit`() {
        val parser = LogLineParser(logParserStrategy, metricsFactory)
        val commit = parser.parseCommit(fullCommit)
        assertThat(commit).extracting(
            java.util.function.Function<Commit, Any> { it.author },
            java.util.function.Function<Commit, Any> { it.commitDate }
        )
            .containsExactly("TheAuthor", OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET))
        assertThat(commit.filenames).containsExactlyInAnyOrder(
            "src/Added.java",
            "src/Modified.java",
            "src/Deleted.java"
        )
    }

    @Test
    fun `parses files in commit lines`() {
        val modifications = logParserStrategy.parseModifications(fullCommit)
        assertThat(modifications).hasSize(3)
        assertThat(modifications).extracting<String, RuntimeException> { it.filename }
            .containsExactlyInAnyOrder("src/Added.java", "src/Modified.java", "src/Deleted.java")
    }

    @Test
    fun `parse author from commit lines`() {
        val author = logParserStrategy.parseAuthor(fullCommit)
        assertThat(author).isEqualTo("TheAuthor")
    }

    @Test
    fun `parse date from commit lines`() {
        val expectedDate = OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZoneOffset.ofHours(2))
        val precision = within(1, ChronoUnit.NANOS)

        val commitDate = logParserStrategy.parseDate(fullCommit)

        assertThat(commitDate).isCloseTo(expectedDate, precision)
    }

    @Test
    @Throws(Exception::class)
    fun `can provide an appropriate log line collector to separate commits`() {
        val commits = twoCommitsAsStream.collect(logParserStrategy.createLogLineCollector())
        assertThat(commits).hasSize(2)
    }

    @Test
    fun `accumulates commit files`() {
        val parser = LogLineParser(logParserStrategy, metricsFactory)

        val logLines = Stream.concat(fullCommit.stream(), fullCommit.stream())
        val files = parser.parse(logLines)
        assertThat(files).extracting(
            java.util.function.Function<VersionControlledFile, Any> { it.filename },
            java.util.function.Function<VersionControlledFile, Any> { f ->
                f.getMetricValue("number_of_commits")
            },
            java.util.function.Function<VersionControlledFile, Any> { it.authors }
        ).containsExactlyInAnyOrder(
            tuple("src/Deleted.java", 2L, setOf("TheAuthor")),
            tuple("src/Added.java", 2L, setOf("TheAuthor")),
            tuple("src/Modified.java", 2L, setOf("TheAuthor"))
        )
    }

    companion object {
        private val ZONE_OFFSET = ZoneOffset.ofHours(2)
    }
}
