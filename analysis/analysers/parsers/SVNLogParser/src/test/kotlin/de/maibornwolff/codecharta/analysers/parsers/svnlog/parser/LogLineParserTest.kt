package de.maibornwolff.codecharta.analysers.parsers.svnlog.parser

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
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
    fun `parse commit`() { // given
        val parserStrategy = mockk<LogParserStrategy>()
        val author = "An Author"
        val commitDate = OffsetDateTime.now()
        val filenames = listOf("src/Main.java", "src/Util.java")
        val input = emptyList<String>()

        every { parserStrategy.parseAuthor(any()) } returns author
        every { parserStrategy.parseDate(any()) } returns commitDate
        every { parserStrategy.parseModifications(input) } returns filenames.map { Modification(it) }

        val parser = LogLineParser(parserStrategy, metricsFactory)

        // when
        val commit = parser.parseCommit(input)

        // then
        assertThat(commit.author).isEqualTo(author)
        assertThat(commit.filenames).isEqualTo(filenames)
        assertThat(commit.commitDate).isEqualTo(commitDate)
    }
}
