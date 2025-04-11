package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.within
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit

class CommitDateParserTest {
    @Test
    fun parseCommitDate() {
        val expectedDate = OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZoneOffset.ofHours(2))
        val precision = within(1, ChronoUnit.NANOS)

        val date = CommitDateParser.parseCommitDate("Date:   Tue May 9 19:57:57 2017 +0200")

        assertThat(date).isCloseTo(expectedDate, precision)
    }
}
