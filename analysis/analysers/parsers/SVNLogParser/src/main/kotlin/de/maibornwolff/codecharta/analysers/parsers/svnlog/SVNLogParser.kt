package de.maibornwolff.codecharta.analysers.parsers.svnlog

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.svnlog.InputFormatNames.SVN_LOG
import de.maibornwolff.codecharta.analysers.parsers.svnlog.converter.ProjectConverter
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.LogParserStrategy
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.svn.SVNLogParserStrategy
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.nio.charset.Charset
import java.nio.file.Files
import java.util.stream.Stream

@CommandLine.Command(
    name = SVNLogParser.NAME,
    description = [SVNLogParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class SVNLogParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator {
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

    override val name = NAME
    override val description = DESCRIPTION

    private val metricsFactory: MetricsFactory
        get() {
            val nonChurnMetrics =
                listOf(
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

    companion object {
        const val NAME = "svnlogparser"
        const val DESCRIPTION = "generates cc.json from svn log file"

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

    @Throws(IOException::class)
    override fun call(): Unit? {
        logExecutionStartedSyncSignal()

        if (!InputHelper.isInputValidAndNotNull(arrayOf(file), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for SVNLogParser, stopping execution...")
        }

        var project =
            createProjectFromLog(
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

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if SVNLogParser is applicable...")
        return ResourceSearchHelper.isFolderDirectlyInGivenDirectory(resourceToBeParsed, ".svn")
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
