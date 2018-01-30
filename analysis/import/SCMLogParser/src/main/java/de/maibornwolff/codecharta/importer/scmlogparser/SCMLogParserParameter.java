package de.maibornwolff.codecharta.importer.scmlogparser;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogRawParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.GIT_LOG;
import static de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.SVN_LOG;

public class SCMLogParserParameter {

    private final JCommander jc;
    @Parameter(description = "[file]")
    private List<String> files = new ArrayList<>();
    @Parameter(names = {"-o", "--outputFile"}, description = "Output File (or empty for stdout)")
    private String outputFile = "";
    @Parameter(names = {"-p", "--projectName"}, description = "Project name")
    private String projectName = "SCMLogParser";
    @Parameter(names = {"--git"}, description = "Analysis of git log, equivalent --input-format GIT_LOG")
    private boolean gitLog = false;
    @Parameter(names = {"--svn"}, description = "Analysis of svn log, equivalent --input-format SVN_LOG")
    private boolean svnLog = false;


    @Parameter(names = {"--input-format"}, description = "Input for parsing")
    private InputFormatNames inputFormatNames;
    @Parameter(names = {"--add-author"}, description = "Add an array of authors to every file")
    private boolean addAuthor = false;
    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    public SCMLogParserParameter(String[] args) {
        this.jc = new JCommander(this);
        this.jc.parse(args);
    }

    List<String> getFiles() {
        return files;
    }

    boolean isHelp() {
        return help;
    }

    String getOutputFile() {
        return outputFile;
    }

    boolean isAddAuthor() {
        return addAuthor;
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

    void printUsage() {
        jc.usage();

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


    LogParserStrategy getLogParserStrategy() {
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

    MetricsFactory getMetricsFactory() {
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

    String getProjectName() {
        return projectName;
    }
}
