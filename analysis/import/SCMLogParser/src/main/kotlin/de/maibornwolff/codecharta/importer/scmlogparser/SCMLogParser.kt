package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
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
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.*
import java.nio.charset.Charset
import java.nio.file.Files
import java.util.*
import java.util.concurrent.Callable
import java.util.stream.Stream


@CommandLine.Command(
        name = "scmlogparser",
        description = ["generates cc.json from scm log file (git or svn)"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class SCMLogParser(private val input: InputStream = System.`in`,
                   private val output: PrintStream = System.out,
                   private val error: PrintStream = System.err) : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["--silent"], description = ["suppress command line output during process"])
    private var silent = false

    @CommandLine.Option(names = ["--input-format"], description = ["input format for parsing"])
    private var inputFormatNames: InputFormatNames = GIT_LOG

    @CommandLine.Option(names = ["--add-author"], description = ["add an array of authors to every file"])
    private var addAuthor = false

    private val logParserStrategy: LogParserStrategy
        get() = getLogParserStrategyByInputFormat(inputFormatNames)

    private val metricsFactory: MetricsFactory
        get() {
            val nonChurnMetrics = Arrays.asList(
                    "age_in_weeks",
                    "number_of_authors",
                    "number_of_commits",
                    "number_of_renames",
                    "range_of_weeks_with_commits",
                    "successive_weeks_of_commits",
                    "weeks_with_commits",
                    "highly_coupled_files",
                    "median_coupled_files"
            )

            return when (inputFormatNames) {
                GIT_LOG, InputFormatNames.GIT_LOG_RAW, SVN_LOG -> MetricsFactory(nonChurnMetrics)
                else                                           -> MetricsFactory()
            }
        }

    @Throws(IOException::class)
    override fun call(): Void? {

        print(" ")
        var project = createProjectFromLog(
                file!!,
                logParserStrategy,
                metricsFactory,
                addAuthor,
                silent)

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }
        if (outputFile.isNotEmpty()) {
            ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile)
        } else {
            ProjectSerializer.serializeProject(project, OutputStreamWriter(output))
        }

        return null
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

    private fun createProjectFromLog(
            pathToLog: File,
            parserStrategy: LogParserStrategy,
            metricsFactory: MetricsFactory,
            containsAuthors: Boolean,
            silent: Boolean = false
    ): Project {
        val encoding = guessEncoding(pathToLog) ?: "UTF-8"
        if (!silent) error.println("Assumed encoding $encoding")
        val lines : Stream<String> = Files.lines(pathToLog.toPath(), Charset.forName(encoding))
        val projectConverter = ProjectConverter(containsAuthors)
        return SCMLogProjectCreator(parserStrategy, metricsFactory, projectConverter, silent).parse(lines)
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

        printLogCreationByInputFormatNames(inputFormatNames)
    }

    private fun printLogCreationByInputFormatNames(actualInfoFormatName: InputFormatNames?) {
        val creationCommand = getLogParserStrategyByInputFormat(actualInfoFormatName!!).creationCommand()
        println(String.format("  \t%s :\t\"%s\".", actualInfoFormatName, creationCommand))
    }

    private fun printMetricInfo() {
        val infoFormat = "  \t%s:\t %s"
        println("  Available metrics:")
        runBlocking(Dispatchers.Default) {
            metricsFactory.createMetrics()
                    .forEach {
                        launch{
                         println(String.format(infoFormat, it.metricName(), it.description()))
                        }
                    }
        }
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SCMLogParser(), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine.call(SCMLogParser(input, output, error), output, *args)
        }

        private fun guessEncoding(pathToLog: File): String? {
            val inputStream = pathToLog.inputStream()
            val buffer = ByteArray(4096)
            val detector = UniversalDetector(null)

            var sizeRead = inputStream.read(buffer)
            while (sizeRead > 0 && !detector.isDone) {
                detector.handleData(buffer, 0, sizeRead)
                sizeRead = inputStream.read(buffer)
            }
            detector.dataEnd()

            return detector.detectedCharset
        }
    }
}
