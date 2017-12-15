package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.model.input.Modification;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class GitLogParserStrategy implements LogParserStrategy {

    public static final String CORRESPONDING_LOG_CREATION_CMD = "git log --name-status --no-renames";

    private static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");
    private static final String AUTHOR_ROW_INDICATOR = "Author: ";
    private static final String DATE_ROW_INDICATOR = "Date: ";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d HH:mm:ss yyyy ZZZ", Locale.US);

    private static boolean isStatusLetter(char character) {
        return Status.ALL_STATUS_LETTERS.contains(character);
    }

    private boolean isFileLine(String commitLine) {
        if (commitLine.length() < 2) {
            return false;
        }
        char firstChar = commitLine.charAt(0);
        char secondChar = commitLine.charAt(1);
        return isStatusLetter(firstChar) && Character.isWhitespace(secondChar);
    }

    Modification parseModification(String fileLine) {
        if (fileLine.isEmpty()) {
            return Modification.EMPTY;
        }
        String filename = fileLine.substring(1);
        return new Modification(filename.trim());
    }

    public Collector<String, ?, Stream<List<String>>> createLogLineCollector() {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST);
    }

    @Override
    public Optional<String> parseAuthor(List<String> commitLines) {
        return commitLines.stream()
                .filter(commitLine -> commitLine.startsWith(AUTHOR_ROW_INDICATOR))
                .map(this::parseAuthor)
                .findFirst();

    }

    String parseAuthor(String authorLine) {
        String authorWithEmail = authorLine.substring(AUTHOR_ROW_INDICATOR.length());
        int beginOfEmail = authorWithEmail.indexOf('<');
        if (beginOfEmail < 0) {
            return authorWithEmail;
        }
        return authorWithEmail.substring(0, beginOfEmail).trim();
    }

    @Override
    public List<Modification> parseModifications(List<String> commitLines) {
        return commitLines.stream()
                .filter(this::isFileLine)
                .map(this::parseModification)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<LocalDateTime> parseDate(List<String> commitLines) {
        return commitLines.stream()
                .filter(commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR))
                .map(this::parseCommitDate)
                .findFirst();
    }

    private LocalDateTime parseCommitDate(String metadataDateLine) {
        String commitDateAsString = metadataDateLine.replace(DATE_ROW_INDICATOR, "").trim();
        return LocalDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER);
    }
}
