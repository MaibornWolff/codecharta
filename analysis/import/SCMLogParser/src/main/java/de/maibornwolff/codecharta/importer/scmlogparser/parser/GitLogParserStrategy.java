package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class GitLogParserStrategy implements LogParserStrategy {

    /*
     * see "diff-raw status letters" at https://github.com/git/git/blob/35f6318d44379452d8d33e880d8df0267b4a0cd0/diff.h#L326
     */
    private static final List<Character> STATUS_LETTERS = Arrays.asList('A', 'C', 'D', 'M', 'R', 'T', 'X', 'U');

    private static final String AUTHOR_ROW_INDICATOR = "Author: ";

    private static final String DATE_ROW_INDICATOR = "Date: ";

    public static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d HH:mm:ss yyyy ZZZ", Locale.US);

    boolean isFileLine(String commitLine) {
        if (commitLine.length() < 2) {
            return false;
        }
        char firstChar = commitLine.charAt(0);
        char secondChar = commitLine.charAt(1);
        return isStatusLetter(firstChar) && Character.isWhitespace(secondChar);
    }

    private static boolean isStatusLetter(char character) {
        return STATUS_LETTERS.contains(character);
    }

    String parseFilename(String fileLine) {
        if (fileLine.isEmpty()) {
            return fileLine;
        }
        String filename = fileLine.substring(1);
        return filename.trim();
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
    public List<String> parseFilenames(List<String> commitLines) {
        return commitLines.stream()
                .filter(this::isFileLine)
                .map(this::parseFilename)
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
        return LocalDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER );
    }
}
