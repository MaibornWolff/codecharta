package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset

class CommitDateParserTest {
    @Test
    fun parseCommitDate() {
        val date = CommitDateParser.parseCommitDate("Date:   Tue May 9 19:57:57 2017 +0200")
        assertThat(date).isEqualToIgnoringNanos(OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZoneOffset.ofHours(2)))
    }
}