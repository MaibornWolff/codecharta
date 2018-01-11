package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Stream;

public interface LogParserStrategy {

    Collector<String, ?, Stream<List<String>>> createLogLineCollector();

    Optional<String> parseAuthor(List<String> commitLines);

    List<Modification> parseModifications(List<String> commitLines);

    Optional<LocalDateTime> parseDate(List<String> commitLines);

    List<String> listSupportedMetrics();

}
