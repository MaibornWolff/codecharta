package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineParser;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.model.Project;

import java.util.List;
import java.util.stream.Stream;

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
public class SCMLogProjectCreator {

    private final ProjectConverter projectConverter;
    private final LogLineParser logLineParser;

    public SCMLogProjectCreator(
            LogParserStrategy parserStrategy,
            MetricsFactory metricsFactory,
            ProjectConverter projectConverter
    ) {
        this.projectConverter = projectConverter;
        this.logLineParser = new LogLineParser(parserStrategy, metricsFactory);
    }

    public Project parse(Stream<String> lines) {
        List<VersionControlledFile> versionControlledFiles = logLineParser.parse(lines);
        Project project = projectConverter.convert(versionControlledFiles);
        return project;
    }

}
