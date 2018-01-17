package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.importer.scmlogparser.parser.git.AuthorParser.AUTHOR_ROW_INDICATOR;
import static de.maibornwolff.codecharta.importer.scmlogparser.parser.git.CommitDateParser.DATE_ROW_INDICATOR;

public class GitLogNumstatRawParserStrategy implements LogParserStrategy {

    public static final String CORRESPONDING_LOG_CREATION_CMD = "git log --numstat --raw --topo-order";
    public static final java.util.function.BiFunction<Modification, Modification, Modification> MODIFICATION_MODIFICATION_MODIFICATION_BI_FUNCTION = (a, b) -> a;
    private static final Predicate<String> GIT_COMMIT_SEPARATOR_TEST = logLine -> logLine.startsWith("commit");
    private static final String FILE_LINE_SPLITTER = "\\s+";

    private static final BinaryOperator<Map<String, Modification>> throwUnsupportedOperationException =
            (a, b) -> {
                throw new UnsupportedOperationException("parallel collection lines not supported");
            };
    private static final Function<Map<String, Modification>, ArrayList<Modification>> mapValuesToList = map -> new ArrayList<>(map.values());

    private static boolean isFileLine(String commitLine) {
        return GitLogRawParserStrategy.isFileLine(commitLine) || GitLogNumstatParserStrategy.isFileLine(commitLine);
    }

    static Modification parseModification(String fileLine) {
        if (fileLine.startsWith(":")) {
            return GitLogRawParserStrategy.parseModification(fileLine);
        }

        return GitLogNumstatParserStrategy.parseModification(fileLine);
    }

    private static Modification mergeModifications(Modification... a) {
        String filename = a[0].getFilename();
        int additions = Arrays.stream(a).mapToInt(Modification::getAdditions).sum();
        int deletions = Arrays.stream(a).mapToInt(Modification::getDeletions).sum();
        Modification.Type type = Arrays.stream(a)
                .map(Modification::getType)
                .filter(t -> t != Modification.Type.UNKNOWN)
                .findFirst()
                .orElse(Modification.Type.UNKNOWN);

        if (type == Modification.Type.RENAME) {
            String oldFilename = Arrays.stream(a)
                    .map(Modification::getOldFilename)
                    .filter(s -> !s.isEmpty())
                    .findFirst()
                    .orElse("");
            return new Modification(filename, oldFilename, additions, deletions, type);
        }

        return new Modification(filename, additions, deletions, type);
    }

    @Override
    public List<String> listSupportedMetrics() {
        return Arrays.asList(
                "code_churn",
                "loc",
                "number_of_authors",
                "number_of_commits",
                "weeks_with_commits"
        );
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
        BiConsumer<Map<String, Modification>, Modification> accumulator =
                (map, mod) -> map.merge(mod.getFilename(), mod, GitLogNumstatRawParserStrategy::mergeModifications);


        return commitLines.stream()
                .filter(GitLogNumstatRawParserStrategy::isFileLine)
                .map(GitLogNumstatRawParserStrategy::parseModification)
                .collect(Collector.of(HashMap::new, accumulator, throwUnsupportedOperationException, mapValuesToList));
    }

    @Override
    public Optional<LocalDateTime> parseDate(List<String> commitLines) {
        return commitLines.stream()
                .filter(commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR))
                .map(CommitDateParser::parseCommitDate)
                .findFirst();
    }
}
