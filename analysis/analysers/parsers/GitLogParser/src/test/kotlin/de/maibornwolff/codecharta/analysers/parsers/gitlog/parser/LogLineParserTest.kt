package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Modification
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class LogLineParserTest {
    private val metricsFactory = mockk<MetricsFactory>()

    @BeforeEach
    fun setup() {
        every { metricsFactory.createMetrics() } returns emptyList()
    }

    @Test
    fun parseCommit() { // given
        val parserStrategy = mockk<LogParserStrategy>()
        val author = "An Author"
        val commitDate = OffsetDateTime.now()
        val filenames = listOf("src/Main.java", "src/Util.java")
        val input = emptyList<String>()

        every { parserStrategy.parseAuthor(any()) } returns author
        every { parserStrategy.parseDate(any()) } returns commitDate
        every { parserStrategy.parseModifications(input) } returns filenames.map { Modification(it) }
        every { parserStrategy.parseIsMergeCommit(input) } returns false

        val parser = LogLineParser(parserStrategy, metricsFactory)

        // when
        val commit = parser.parseCommit(input)

        // then
        assertThat(commit.author).isEqualTo(author)
        assertThat(commit.fileNameList).isEqualTo(filenames)
        assertThat(commit.commitDate).isEqualTo(commitDate)
    }
}
