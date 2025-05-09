package de.maibornwolff.codecharta.analysers.parsers.svnlog.parser

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.VersionControlledFile
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.util.function.Function
import java.util.stream.Stream

class CommitCollectorTest {
    private val metricsFactory = MetricsFactory()

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
    }

    @Test
    fun `collects commits`() {
        val commitDate = OffsetDateTime.now()
        val firstCommit = Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), commitDate)
        val secondCommit = Commit("AnotherAuthor", modificationsByFilename("src/Util.java"), commitDate)
        val commits = Stream.of(firstCommit, secondCommit).collect(CommitCollector.create(metricsFactory))
        assertThat(commits).extracting(
            Function<VersionControlledFile, Any> { it.filename },
            Function<VersionControlledFile, Any> { f -> f.getMetricValue("number_of_commits") },
            Function<VersionControlledFile, Any> { it.authors }
        ).containsExactly(
            tuple("src/Main.java", 1L, setOf("TheAuthor")),
            tuple("src/Util.java", 2L, HashSet(listOf("TheAuthor", "AnotherAuthor")))
        )
    }

    @Test
    fun `does not collect empty filenames`() {
        val commit = Commit("TheAuthor", modificationsByFilename(""), OffsetDateTime.now())
        val commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory))
        assertThat(commits).isEmpty()
    }

    @Test
    fun `collects half empty filelists`() {
        val commit = Commit("TheAuthor", modificationsByFilename("", "src/Main.java"), OffsetDateTime.now())
        val commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory))
        assertThat(commits).extracting<String, RuntimeException> { it.filename }.containsExactly("src/Main.java")
    }

    @Test
    fun doesNotSupportParallelStreams() {
        val commit =
            Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), OffsetDateTime.now())
        val parallelCommitStream = Stream.of(commit, commit).parallel()
        assertThatThrownBy { parallelCommitStream.collect(CommitCollector.create(metricsFactory)) }.isInstanceOf(
            UnsupportedOperationException::class.java
        )
    }
}
