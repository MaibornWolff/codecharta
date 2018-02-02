package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogRawParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import picocli.CommandLine;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.GIT_LOG;
import static de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.SVN_LOG;

@CommandLine.Command(name = "scmlogparser",
        description = "generates cc.json from scm log file (git or svn)",
        footer = "Copyright(c) 2018, MaibornWolff GmbH"
)
public class SCMLogParser implements Callable<Void> {

    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true, description = "displays this help and exits")
    private Boolean help = false;

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = {"file to parse"})
    private String file = "";

    @CommandLine.Option(names = {"-o", "--outputFile"}, description = "output File (or empty for stdout)")
    private String outputFile = "";

    @CommandLine.Option(names = {"-p", "--projectName"}, description = "project name")
    private String projectName = "SCMLogParser";

    @CommandLine.Option(names = {"--git"}, description = "analysis of git log, equivalent --input-format GIT_LOG")
    private boolean gitLog = false;

    @CommandLine.Option(names = {"--svn"}, description = "analysis of svn log, equivalent --input-format SVN_LOG")
    private boolean svnLog = false;

    @CommandLine.Option(names = {"--input-format"}, description = "input format for parsing")
    private InputFormatNames inputFormatNames;

    @CommandLine.Option(names = {"--add-author"}, description = "add an array of authors to every file")
    private boolean addAuthor = false;

    public static void main(String[] args) {
        CommandLine.call(new SCMLogParser(), System.out, args);
    }

    private static Project createProjectFromLog(
            String pathToLog,
            LogParserStrategy parserStrategy,
            MetricsFactory metricsFactory,
            String projectName,
            boolean containsAuthors
    ) throws IOException {

        Stream<String> lines = Files.lines(Paths.get(pathToLog));
        ProjectConverter projectConverter = new ProjectConverter(containsAuthors, projectName);
        return new SCMLogProjectCreator(parserStrategy, metricsFactory, projectConverter).parse(lines);

    }

    @Override
    public Void call() throws IOException {
        Project project = createProjectFromLog(
                file,
                getLogParserStrategy(),
                getMetricsFactory(),
                projectName,
                addAuthor);
        if (outputFile != null && !outputFile.isEmpty()) {
            ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile);
        } else {
            ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
        }

        return null;
    }

    private InputFormatNames getInputFormatNames() {
        if (gitLog && !svnLog) {
            return GIT_LOG;
        } else if (svnLog && !gitLog) {
            return SVN_LOG;
        } else if (svnLog && gitLog) {
            throw new IllegalArgumentException("only one of --git or --svn must be set");
        }

        return inputFormatNames;
    }

    private LogParserStrategy getLogParserStrategy() {
        return getLogParserStrategyByInputFormat(getInputFormatNames());
    }

    private LogParserStrategy getLogParserStrategyByInputFormat(InputFormatNames formatName) {
        switch (formatName) {
            case GIT_LOG:
                return new GitLogParserStrategy();
            case GIT_LOG_NUMSTAT:
                return new GitLogNumstatParserStrategy();
            case GIT_LOG_RAW:
                return new GitLogRawParserStrategy();
            case GIT_LOG_NUMSTAT_RAW:
                return new GitLogNumstatRawParserStrategy();
            case SVN_LOG:
                return new SVNLogParserStrategy();
            default:
                throw new IllegalArgumentException("--git or --svn or --input-format must specified");
        }
    }

    private MetricsFactory getMetricsFactory() {
        final List<String> nonChurnMetrics = Arrays.asList(
                "number_of_authors",
                "number_of_commits",
                "range_of_weeks_with_commits",
                "successive_weeks_of_commits",
                "weeks_with_commits"
        );

        if (getInputFormatNames() == null) {
            return new MetricsFactory();
        }

        switch (getInputFormatNames()) {
            case GIT_LOG:
            case GIT_LOG_RAW:
            case SVN_LOG:
                return new MetricsFactory(nonChurnMetrics);
            default:
                return new MetricsFactory();
        }
    }


    // not implemented yet.
    private void printUsage() {
        System.out.println("----");
        printLogCreation();

        System.out.println("----");
        printMetricInfo();
    }

    private void printLogCreation() {
        System.out.println("  Log creation via:");

        if (getInputFormatNames() != null) {
            printLogCreationByInputFormatNames(getInputFormatNames());
        } else {
            Stream.of(InputFormatNames.class.getEnumConstants())
                    .forEach(this::printLogCreationByInputFormatNames);
        }
    }

    private void printLogCreationByInputFormatNames(InputFormatNames actualInfoFormatName) {
        String creationCommand = getLogParserStrategyByInputFormat(actualInfoFormatName).creationCommand();
        System.out.println(String.format("  \t%s :\t\"%s\".", actualInfoFormatName, creationCommand));
    }

    private void printMetricInfo() {
        String infoFormat = "  \t%s:\t %s";
        System.out.println("  Available metrics:");
        getMetricsFactory().createMetrics().forEach(
                metric -> System.out.println(String.format(infoFormat, metric.metricName(), metric.description()))
        );
    }
}
