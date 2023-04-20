package de.maibornwolff.codecharta.importer.svnlogparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.svnlogparser.InputFormatNames.SVN_LOG
import de.maibornwolff.codecharta.importer.svnlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.svnlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.svnlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.svnlogparser.parser.svn.SVNLogParserStrategy
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.nio.charset.Charset
import java.nio.file.Files
import java.util.Arrays
import java.util.concurrent.Callable
import java.util.stream.Stream

@CommandLine.Command(
    name = InteractiveParserHelper.SVNLogParserConstants.name,
    description = [InteractiveParserHelper.SVNLogParserConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class SVNLogParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--silent"], description = ["suppress command line output during process"])
    private var silent = false

    private var inputFormatNames: InputFormatNames = SVN_LOG

    @CommandLine.Option(names = ["--add-author"], description = ["add an array of authors to every file"])
    private var addAuthor = false

    private val logParserStrategy: LogParserStrategy = SVNLogParserStrategy()

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
                SVN_LOG -> MetricsFactory(nonChurnMetrics)
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
            silent
        )

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
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
        val lines: Stream<String> = Files.lines(pathToLog.toPath(), Charset.forName(encoding))
        val projectConverter = ProjectConverter(containsAuthors)
        val logSizeInByte = file!!.length()
        return SVNLogProjectCreator(
            parserStrategy,
            metricsFactory,
            projectConverter,
            logSizeInByte,
            silent
        ).parse(lines)
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

        println(String.format("  \t%s :\t\"%s\".", inputFormatNames, logParserStrategy.creationCommand()))
    }

    private fun printMetricInfo() {
        val infoFormat = "  \t%s:\t %s"
        println("  Available metrics:")
        runBlocking(Dispatchers.Default) {
            metricsFactory.createMetrics()
                .forEach {
                    launch {
                        println(String.format(infoFormat, it.metricName(), it.description()))
                    }
                }
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(SVNLogParser()).execute(*args)
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

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isUsable(inputFile: String): Boolean {
        return false
    }

    override fun getName(): String {
        return InteractiveParserHelper.SVNLogParserConstants.name
    }
}
