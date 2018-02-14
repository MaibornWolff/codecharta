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

public class GitLogRawParserStrategy implements LogParserStrategy {

    private static final String FILE_LINE_REGEX = ":\\d+\\s+\\d+\\s+\\S+\\s+\\S+\\s+.+";
    private static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");
    private static final String FILE_LINE_SPLITTER = "\\s+";

    static boolean isFileLine(String commitLine) {
        return commitLine.length() >= 5 && commitLine.matches(FILE_LINE_REGEX);
    }

    static Modification parseModification(String fileLine) {
        String[] lineParts = fileLine.split(FILE_LINE_SPLITTER);
        Status status = Status.byCharacter(lineParts[4].trim().charAt(0));

        if (status == Status.RENAMED) {
            return new Modification(lineParts[6].trim(), lineParts[5].trim(), status.toModificationType());
        }

        return new Modification(lineParts[5].trim(), status.toModificationType());
    }

    @Override
    public String creationCommand() {
        return "git log --raw --topo-order";
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
                .filter(GitLogRawParserStrategy::isFileLine)
                .map(GitLogRawParserStrategy::parseModification)
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
