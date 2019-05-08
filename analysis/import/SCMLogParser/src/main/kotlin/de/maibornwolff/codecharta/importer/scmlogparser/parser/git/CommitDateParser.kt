package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.*

internal object CommitDateParser {
    const val DATE_ROW_INDICATOR = "Date: "
    private val DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d HH:mm:ss yyyy ZZZ", Locale.US)

    fun parseCommitDate(metadataDateLine: String): OffsetDateTime {
        val commitDateAsString = metadataDateLine.removePrefix(DATE_ROW_INDICATOR).trim()
        return OffsetDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER)
    }
}