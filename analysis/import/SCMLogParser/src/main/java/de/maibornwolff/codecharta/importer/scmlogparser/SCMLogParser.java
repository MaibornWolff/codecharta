package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParser;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class SCMLogParser {

    public static void main(String[] args) throws IOException {
        SCMLogParserParameter callParameter = new SCMLogParserParameter(args);

        if (callParameter.isHelp() || callParameter.getFiles().size() != 1) {
            callParameter.printUsage();
        } else {
            String pathToLog = callParameter.getFiles().get(0);
            boolean addAuthor = callParameter.isAddAuthor();
            String outputFile = callParameter.getOutputFile();

            Project project = parseDataFromLog(
                    pathToLog,
                    callParameter.getLogParserStrategy(),
                    callParameter.getMetricsFactory(),
                    addAuthor);
            if (outputFile != null && !outputFile.isEmpty()) {
                ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile);
            } else {
                ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
            }
        }
    }

    private static Project parseDataFromLog(
            String pathToLog, LogParserStrategy
            parserStrategy,
            MetricsFactory metricsFactory,
            boolean containsAuthors
    ) throws IOException {

        Stream<String> lines = Files.lines(Paths.get(pathToLog));
        return new LogParser(parserStrategy, containsAuthors, metricsFactory).parse(lines);

    }
}
