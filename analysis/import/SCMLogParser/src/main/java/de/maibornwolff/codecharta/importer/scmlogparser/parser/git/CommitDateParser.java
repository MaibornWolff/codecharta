package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

class CommitDateParser {
    static final String DATE_ROW_INDICATOR = "Date: ";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d HH:mm:ss yyyy ZZZ", Locale.US);


    static OffsetDateTime parseCommitDate(String metadataDateLine) {
        String commitDateAsString = metadataDateLine.replace(DATE_ROW_INDICATOR, "").trim();
        return OffsetDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER);
    }
}