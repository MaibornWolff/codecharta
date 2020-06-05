package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
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
    </String> */
    protected abstract val fullCommit: List<String>
    protected abstract val logParserStrategy: LogParserStrategy
    protected abstract val twoCommitsAsStraem: Stream<String>

    @Test
    fun parsesCommit() {
        val parser = LogLineParser(logParserStrategy, metricsFactory)
        val commit = parser.parseCommit(fullCommit)
        assertThat(commit)
            .extracting(java.util.function.Function<Commit, Any> { it.author },
                java.util.function.Function<Commit, Any> { it.commitDate })
            .containsExactly("TheAuthor", OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET))
        assertThat(commit.filenames)
            .containsExactlyInAnyOrder("src/Added.java", "src/Modified.java", "src/Deleted.java")
    }

    @Test
    fun parsesFilesInCommitLines() {
        val modifications = logParserStrategy.parseModifications(fullCommit)
        assertThat(modifications).hasSize(3)
        assertThat(modifications)
            .extracting<String, RuntimeException> { it.filename }
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
    fun canProvidesAnAproppriateLogLineCollectorToSeparateCommits() {
        val commits = twoCommitsAsStraem.collect(logParserStrategy.createLogLineCollector())
        assertThat(commits).hasSize(2)
    }

    @Test
    fun accumulatesCommitFiles() {
        val parser = LogLineParser(logParserStrategy, metricsFactory)
        val logLines = Stream.concat(fullCommit.stream(), fullCommit.stream())
        val files = parser.parse(logLines)
        assertThat(files)
            .extracting(java.util.function.Function<VersionControlledFile, Any> { it.filename },
                java.util.function.Function<VersionControlledFile, Any> { f ->
                    f.getMetricValue("number_of_commits")
                },
                java.util.function.Function<VersionControlledFile, Any> { it.authors })
            .containsExactlyInAnyOrder(
                tuple("src/Deleted.java", 2L, setOf("TheAuthor")),
                tuple("src/Added.java", 2L, setOf("TheAuthor")),
                tuple("src/Modified.java", 2L, setOf("TheAuthor"))
            )
    }

    companion object {
        private val ZONE_OFFSET = ZoneOffset.ofHours(2)
    }
}
