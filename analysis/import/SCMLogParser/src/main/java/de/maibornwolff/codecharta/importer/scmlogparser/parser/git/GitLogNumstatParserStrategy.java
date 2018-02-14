package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.importer.scmlogparser.parser.git.AuthorParser.AUTHOR_ROW_INDICATOR;
import static de.maibornwolff.codecharta.importer.scmlogparser.parser.git.CommitDateParser.DATE_ROW_INDICATOR;

public class GitLogNumstatParserStrategy implements LogParserStrategy {

    private static final String STANDARD_FILE_LINE_REGEX = "\\d+\\s+\\d+\\s+\\S+\\s*";
    private static final String RENAME_FILE_LINE_REGEX = "\\d+\\s+\\d+\\s+\\S*\\S+ => \\S+\\S*\\s*";
    private static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");
    private static final String STANDARD_FILE_LINE_SPLITTER = "\\s+";
    private static final String RENAME_FILE_LINE_SPLITTER = "[{}\\s+]";

    static boolean isFileLine(String commitLine) {
        return commitLine.length() >= 5
                && (commitLine.matches(STANDARD_FILE_LINE_REGEX) || commitLine.matches(RENAME_FILE_LINE_REGEX));
    }

    static Modification parseModification(String fileLine) {
        if (fileLine.matches(STANDARD_FILE_LINE_REGEX)) {
            return parseStandardModification(fileLine);
        } else if (fileLine.matches(RENAME_FILE_LINE_REGEX)) {
            return parseRenameModification(fileLine);
        }

        return Modification.EMPTY;
    }

    private static Modification parseRenameModification(String fileLine) {
        String[] lineParts = fileLine.split(RENAME_FILE_LINE_SPLITTER);
        int additions = Integer.parseInt(lineParts[0]);
        int deletions = Integer.parseInt(lineParts[1]);
        String oldFileName;
        String newFileName;


        if ("=>".equals(lineParts[4])) {
            oldFileName = lineParts[2] + lineParts[3] + (lineParts.length > 6 ? lineParts[6] : "");
            if (lineParts[3].isEmpty()) {
                oldFileName = oldFileName.replaceAll("//", "/");
            }

            newFileName = lineParts[2] + lineParts[5] + (lineParts.length > 6 ? lineParts[6] : "");
            if (lineParts[5].isEmpty()) {
                newFileName = newFileName.replaceAll("//", "/");
            }
        } else if ("=>".equals(lineParts[3])) {
            oldFileName = lineParts[2];
            newFileName = lineParts[4];
        } else {
            System.err.println("Log line could not be parsed" + fileLine);
            return Modification.EMPTY;
        }


        return new Modification(newFileName, oldFileName, additions, deletions, Modification.Type.RENAME);
    }

    private static Modification parseStandardModification(String fileLine) {
        String[] lineParts = fileLine.split(STANDARD_FILE_LINE_SPLITTER);
        int additions = Integer.parseInt(lineParts[0]);
        int deletions = Integer.parseInt(lineParts[1]);
        String filename = lineParts[2];
        return new Modification(filename.trim(), additions, deletions);
    }

    @Override
    public String creationCommand() {
        return "git log --numstat --topo-order";
    }

    @Override
    public Collector<String, ?, Stream<List<String>>> createLogLineCollector() {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST);
    }

    @Override
    public Optional<String> parseAuthor(List<String> commitLines) {
        return commitLines.stream()
                .filter(commitLine -> commitLine.startsWith(AUTHOR_ROW_INDICATOR))
                .map(AuthorParser::parseAuthor)
                .findFirst();
    }

    @Override
    public List<Modification> parseModifications(List<String> commitLines) {
        return commitLines.stream()
                .filter(GitLogNumstatParserStrategy::isFileLine)
                .map(GitLogNumstatParserStrategy::parseModification)
                .filter(mod -> mod != Modification.EMPTY)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<OffsetDateTime> parseDate(List<String> commitLines) {
        return commitLines.stream()
                .filter(commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR))
                .map(CommitDateParser::parseCommitDate)
                .findFirst();
    }
}
