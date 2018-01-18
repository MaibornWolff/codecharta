package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Stream;

/**
 * Parses log lines and generates VersionControlledFiles from them using specific parserStrategy and metricsFactory
 */
public class LogLineParser {
    private final LogParserStrategy parserStrategy;
    private final MetricsFactory metricsFactory;

    public LogLineParser(LogParserStrategy parserStrategy, MetricsFactory metricsFactory) {
        this.parserStrategy = parserStrategy;
        this.metricsFactory = metricsFactory;
    }

    public List<VersionControlledFile> parse(Stream<String> logLines) {
        return logLines.collect(parserStrategy.createLogLineCollector())
                .map(this::parseCommit)
                .collect(CommitCollector.create(metricsFactory));
    }


    Commit parseCommit(List<String> commitLines) {
        String author = parserStrategy.parseAuthor(commitLines).orElseThrow(() -> new IllegalArgumentException("No author found in input"));
        OffsetDateTime commitDate = parserStrategy.parseDate(commitLines).orElseThrow(() -> new IllegalArgumentException("No commit date found in input"));
        List<Modification> modifications = parserStrategy.parseModifications(commitLines);
        return new Commit(author, modifications, commitDate);
    }
}