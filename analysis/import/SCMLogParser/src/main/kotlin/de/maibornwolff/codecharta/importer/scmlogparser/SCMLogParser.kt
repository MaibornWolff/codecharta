package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.GIT_LOG
import de.maibornwolff.codecharta.importer.scmlogparser.InputFormatNames.SVN_LOG
import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogRawParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.OutputStreamWriter
import java.util.*
import java.util.concurrent.Callable
import java.util.stream.Stream

@CommandLine.Command(
        name = "scmlogparser",
        description = ["generates cc.json from scm log file (git or svn)"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class SCMLogParser: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "SCMLogParser"

    @CommandLine.Option(names = ["--git"], hidden = true,
            description = ["analysis of git log, equivalent --input-format GIT_LOG"])
    private var gitLog = false

    @CommandLine.Option(names = ["--svn"], hidden = true,
            description = ["analysis of svn log, equivalent --input-format SVN_LOG"])
    private var svnLog = false

    @CommandLine.Option(names = ["--silent"], description = ["suppress command line output during process"])
    private var silent = false

    @CommandLine.Option(names = ["--input-format"], description = ["input format for parsing"])
    private var inputFormatNames: InputFormatNames = GIT_LOG

    @CommandLine.Option(names = ["--add-author"], description = ["add an array of authors to every file"])
    private var addAuthor = false

    private val logParserStrategy: LogParserStrategy
        get() = getLogParserStrategyByInputFormat(getInputFormatNames()!!)

    private val metricsFactory: MetricsFactory
        get() {
            val nonChurnMetrics = Arrays.asList(
                    "age_in_weeks",
                    "number_of_authors",
                    "number_of_commits",
                    "number_of_renames",
                    "range_of_weeks_with_commits",
                    "successive_weeks_of_commits",
                    "weeks_with_commits"
            )

            if (getInputFormatNames() == null) {
                return MetricsFactory()
            }

            return when (getInputFormatNames()) {
                GIT_LOG, InputFormatNames.GIT_LOG_RAW, SVN_LOG -> MetricsFactory(nonChurnMetrics)
                else                                           -> MetricsFactory()
            }
        }

    @Throws(IOException::class)
    override fun call(): Void? {
        val project = createProjectFromLog(
                file!!,
                logParserStrategy,
                metricsFactory,
                projectName,
                addAuthor,
                silent)
        if (outputFile.isNotEmpty()) {
            ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile)
        } else {
            ProjectSerializer.serializeProject(project, OutputStreamWriter(System.out))
        }

        return null
    }

    private fun getInputFormatNames(): InputFormatNames? {
        if (gitLog && !svnLog) {
            return GIT_LOG
        } else if (svnLog && !gitLog) {
            return SVN_LOG
        } else if (svnLog && gitLog) {
            throw IllegalArgumentException("only one of --git or --svn must be set")
        }

        return inputFormatNames
    }

    private fun getLogParserStrategyByInputFormat(formatName: InputFormatNames): LogParserStrategy {
        return when (formatName) {
            GIT_LOG                              -> GitLogParserStrategy()
            InputFormatNames.GIT_LOG_NUMSTAT     -> GitLogNumstatParserStrategy()
            InputFormatNames.GIT_LOG_RAW         -> GitLogRawParserStrategy()
            InputFormatNames.GIT_LOG_NUMSTAT_RAW -> GitLogNumstatRawParserStrategy()
            SVN_LOG                              -> SVNLogParserStrategy()
        }
    }

    // not implemented yet.
    private fun printUsage() {
        println("----")
        printLogCreation()

        println("----")
        printMetricInfo()
    }

    private fun printLogCreation() {
        println("  Log creation via:")

        if (getInputFormatNames() != null) {
            printLogCreationByInputFormatNames(getInputFormatNames())
        } else {
            Stream.of<InputFormatNames>(*InputFormatNames::class.java.enumConstants)
                    .forEach { this.printLogCreationByInputFormatNames(it) }
        }
    }

    private fun printLogCreationByInputFormatNames(actualInfoFormatName: InputFormatNames?) {
        val creationCommand = getLogParserStrategyByInputFormat(actualInfoFormatName!!).creationCommand()
        println(String.format("  \t%s :\t\"%s\".", actualInfoFormatName, creationCommand))
    }

    private fun printMetricInfo() {
        val infoFormat = "  \t%s:\t %s"
        println("  Available metrics:")
        metricsFactory.createMetrics()
                .forEach { metric -> println(String.format(infoFormat, metric.metricName(), metric.description())) }
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SCMLogParser(), System.out, *args)
        }

        @Throws(IOException::class)
        private fun createProjectFromLog(
                pathToLog: File,
                parserStrategy: LogParserStrategy,
                metricsFactory: MetricsFactory,
                projectName: String,
                containsAuthors: Boolean,
                silent: Boolean = false
        ): Project {

            val lines = pathToLog.readLines().stream()
            val projectConverter = ProjectConverter(containsAuthors, projectName)
            return SCMLogProjectCreator(parserStrategy, metricsFactory, projectConverter, silent).parse(lines)
        }
    }
}
