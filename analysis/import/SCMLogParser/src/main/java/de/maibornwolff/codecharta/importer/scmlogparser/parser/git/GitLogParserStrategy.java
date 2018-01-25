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

public class GitLogParserStrategy implements LogParserStrategy {

    private static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");
    private static final String FILE_LINE_REGEX = "\\w\\d*\\s+\\S+(.*|\\s+\\S+.*)";

    private static boolean isStatusLetter(char character) {
        return Status.ALL_STATUS_LETTERS.contains(character);
    }

    private static boolean isFileLine(String commitLine) {
        return commitLine.length() >= 3 && commitLine.matches(FILE_LINE_REGEX) && isStatusLetter(commitLine.charAt(0));
    }

    static Modification parseModification(String fileLine) {
        if (fileLine.isEmpty()) {
            return Modification.EMPTY;
        }
        Status status = Status.byCharacter(fileLine.charAt(0));
        String[] lineParts = fileLine.split("\\s+");

        if (status == Status.RENAMED) {
            return new Modification(lineParts[2].trim(), lineParts[1].trim(), status.toModificationType());
        }

        return new Modification(lineParts[1].trim(), status.toModificationType());
    }

    @Override
    public String creationCommand() {
        return "git log --name-status --topo-order";
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
                .filter(GitLogParserStrategy::isFileLine)
                .map(GitLogParserStrategy::parseModification)
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
