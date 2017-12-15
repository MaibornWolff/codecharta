package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.model.input.Modification;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SVNLogParserStrategy implements LogParserStrategy {

    public static final String CORRESPONDING_LOG_CREATION_CMD = "svn log --verbose";
    private static final Predicate<String> SVN_COMMIT_SEPARATOR_TEST = logLine -> !logLine.isEmpty() && StringUtils.containsOnly(logLine, '-');
    private static final String[] DEFAULT_REPOSITORY_FOLDER_PREFIXES = new String[]{"/branches/", "/tags/", "/trunk/"};
    private static final DateTimeFormatter DATE_TIME_FORMATTER = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .append(DateTimeFormatter.ISO_LOCAL_DATE)
            .appendLiteral(' ')
            .append(DateTimeFormatter.ISO_LOCAL_TIME)
            .appendLiteral(' ')
            .appendOffset("+HHMM", "")
            .toFormatter();
    private static final int AUTHOR_INDEX_IN_METADATA = 1;
    private static final int DATE_INDEX_IN_METADATA = 2;
    private static final char METADATA_SEPARATOR = '|';

    private static String stripWhitespacePrefix(String string) {
        return StringUtils.stripStart(string, null);
    }

    private static boolean isStatusLetter(char character) {
        return Status.ALL_STATUS_LETTERS.contains(character);
    }

    private static String removeDefaultRepositoryFolderPrefix(String path) {
        for (String prefix : DEFAULT_REPOSITORY_FOLDER_PREFIXES) {
            if (path.startsWith(prefix)) {
                return path.substring(prefix.length());
            }
        }
        return path;
    }

    private static Modification ignoreIfRepresentsFolder(Modification modification) {
        if (!modification.getFilename().contains(".")) {
            return Modification.EMPTY;
        }
        return modification;
    }

    @Override
    public Optional<LocalDateTime> parseDate(List<String> commitLines) {
        return commitLines.stream()
                .filter(this::isMetadataLine)
                .map(this::parseCommitDate)
                .findFirst();
    }

    private LocalDateTime parseCommitDate(String metadataLine) {
        String[] splittedLine = metadataLine.split("\\" + METADATA_SEPARATOR);
        String commitDateAsString = splittedLine[DATE_INDEX_IN_METADATA].trim().replaceAll(" \\(.*\\)", "");
        return LocalDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER);
    }

    @Override
    public Optional<String> parseAuthor(List<String> commitLines) {
        return commitLines.stream()
                .filter(this::isMetadataLine)
                .map(this::parseAuthor)
                .findFirst();
    }

    private boolean isMetadataLine(String commitLine) {
        return commitLine.contains(Character.toString(METADATA_SEPARATOR));
    }

    private String parseAuthor(String authorLine) {
        String[] splittedLine = authorLine.split("\\" + METADATA_SEPARATOR);
        return splittedLine[AUTHOR_INDEX_IN_METADATA].trim();
    }

    @Override
    public List<Modification> parseModifications(List<String> commitLines) {
        return commitLines.stream()
                .filter(this::isFileLine)
                .map(this::parseModification)
                .collect(Collectors.toList());
    }

    private boolean isFileLine(String commitLine) {
        String commitLineWithoutWhitespacePrefix = stripWhitespacePrefix(commitLine);
        if (commitLineWithoutWhitespacePrefix.length() < 2) {
            return false;
        }
        char firstChar = commitLineWithoutWhitespacePrefix.charAt(0);
        char secondChar = commitLineWithoutWhitespacePrefix.charAt(1);
        return isStatusLetter(firstChar) && Character.isWhitespace(secondChar);
    }

    Modification parseModification(String fileLine) {
        String metadataWithoutWhitespacePrefix = stripWhitespacePrefix(fileLine);
        String metadataWithoutStatusLetter = metadataWithoutWhitespacePrefix.substring(1);
        String filePath = removeDefaultRepositoryFolderPrefix(metadataWithoutStatusLetter.trim());
        return ignoreIfRepresentsFolder(new Modification(filePath));
    }

    public Collector<String, ?, Stream<List<String>>> createLogLineCollector() {
        return LogLineCollector.create(SVN_COMMIT_SEPARATOR_TEST);
    }


}
