package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.gitlogparser.InputFormatNames.GIT_LOG_NUMSTAT_RAW_REVERSED
import de.maibornwolff.codecharta.importer.gitlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.gitlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.gitlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.gitlogparser.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParser
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParserSyncFlag
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.nio.charset.Charset
import java.nio.file.Files
import java.util.concurrent.Callable
import java.util.stream.Stream

@CommandLine.Command(
        name = GitLogParser.NAME,
        description = [GitLogParser.DESCRIPTION],
    subcommands = [LogScanCommand::class, RepoScanCommand::class],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class GitLogParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Unit>, InteractiveParser, PipeableParser, AttributeGenerator {

    private val inputFormatNames = GIT_LOG_NUMSTAT_RAW_REVERSED

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "gitlogparser"
        const val DESCRIPTION = "generates cc.json from git-log files"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(GitLogParser()).execute(*args)
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

    private val logParserStrategy: LogParserStrategy
        get() = getLogParserStrategyByInputFormat(inputFormatNames)

    private val metricsFactory: MetricsFactory
        get() {
            val nonChurnMetrics = listOf(
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
                GIT_LOG_NUMSTAT_RAW_REVERSED -> MetricsFactory(nonChurnMetrics)
            }
        }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logPipeableParserSyncSignal(PipeableParserSyncFlag.SYNC_FLAG)
        return null
    }

    internal fun buildProject(
        gitLogFile: File,
        gitLsFile: File,
        outputFilePath: String?,
        addAuthor: Boolean,
        silent: Boolean,
        compress: Boolean
    ) {
        var project = createProjectFromLog(
            gitLogFile,
            gitLsFile,
            logParserStrategy,
            metricsFactory,
            addAuthor,
            silent
        )

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, output, compress)
    }

    private fun getLogParserStrategyByInputFormat(formatName: InputFormatNames): LogParserStrategy {
        return when (formatName) {
            GIT_LOG_NUMSTAT_RAW_REVERSED -> GitLogNumstatRawParserStrategy()
        }
    }

    private fun readFileNameListFile(path: File): MutableList<String> {
        val inputStream: InputStream = path.inputStream()
        val lineList = mutableListOf<String>()

        inputStream.bufferedReader().forEachLine { lineList.add(it) }

        return lineList
    }

    private fun createProjectFromLog(
        gitLogFile: File,
        gitLsFile: File,
        parserStrategy: LogParserStrategy,
        metricsFactory: MetricsFactory,
        containsAuthors: Boolean,
        silent: Boolean = false
    ): Project {
        val namesInProject = readFileNameListFile(gitLsFile)
        val encoding = guessEncoding(gitLogFile) ?: "UTF-8"
        if (!silent) error.println("Assumed encoding $encoding")
        val lines: Stream<String> = Files.lines(gitLogFile.toPath(), Charset.forName(encoding))
        val projectConverter = ProjectConverter(containsAuthors)
        val logSizeInByte = gitLogFile.length()
        return GitLogProjectCreator(parserStrategy, metricsFactory, projectConverter, logSizeInByte, silent).parse(
            lines,
            namesInProject
        )
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if GitLogParser is applicable...")
        return ResourceSearchHelper.isFolderDirectlyInGivenDirectory(resourceToBeParsed, ".git")
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
