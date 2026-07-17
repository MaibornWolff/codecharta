package de.maibornwolff.codecharta.analysers.parsers.gitlog

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.gitlog.InputFormatNames.GIT_LOG_NUMSTAT_RAW_REVERSED
import de.maibornwolff.codecharta.analysers.parsers.gitlog.converter.ProjectConverter
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.LogParserStrategy
import de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git.helper.GitPathUnquoter
import de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands.LogScanCommand
import de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.nio.ByteBuffer
import java.nio.CharBuffer
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction
import java.nio.file.Files
import java.util.stream.Stream

@CommandLine.Command(
    name = GitLogParser.NAME,
    description = [GitLogParser.DESCRIPTION],
    subcommands = [LogScanCommand::class, RepoScanCommand::class],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class GitLogParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface,
    AttributeGenerator {
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

        // Prefer UTF-8; fall back to the JVM default when the log contains non-UTF-8 bytes.
        // Used because the charset detector misreads a mostly-ASCII log with a few multi-byte paths as a
        // single-byte Western encoding (e.g. WINDOWS-1252), garbling non-ASCII paths and losing their metrics.
        internal fun determineLogEncoding(pathToLog: File): String {
            if (isValidUtf8(pathToLog)) return "UTF-8"
            return guessEncoding(pathToLog) ?: "UTF-8"
        }

        internal fun isValidUtf8(file: File): Boolean {
            val decoder = Charsets.UTF_8
                .newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
            val readBuffer = ByteArray(UTF8_VALIDATION_CHUNK)
            // +4 headroom holds an incomplete multi-byte sequence carried over between chunks.
            val byteBuffer = ByteBuffer.allocate(UTF8_VALIDATION_CHUNK + 4)
            val charBuffer = CharBuffer.allocate(UTF8_VALIDATION_CHUNK + 4)

            file.inputStream().buffered().use { input ->
                while (true) {
                    val read = input.read(readBuffer)
                    if (read < 0) break
                    byteBuffer.put(readBuffer, 0, read)
                    byteBuffer.flip()
                    if (decoder.decode(byteBuffer, charBuffer, false).isError) return false
                    charBuffer.clear()
                    byteBuffer.compact()
                }
            }
            byteBuffer.flip()
            if (decoder.decode(byteBuffer, charBuffer, true).isError) return false
            return !decoder.flush(charBuffer).isError
        }

        private const val UTF8_VALIDATION_CHUNK = 8192
    }

    private val logParserStrategy: LogParserStrategy
        get() = getLogParserStrategyByInputFormat(inputFormatNames)

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
                    "median_coupled_files",
                    "feat_commits",
                    "fix_commits",
                    "docs_commits",
                    "style_commits",
                    "refactor_commits",
                    "hotfix_commits",
                    "test_commits",
                    "semantic_commit_ratio",
                    "hotfix_commit_ratio"
                )

            return when (inputFormatNames) {
                GIT_LOG_NUMSTAT_RAW_REVERSED -> MetricsFactory(nonChurnMetrics)
            }
        }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logExecutionStartedSyncSignal()
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
        var project =
            createProjectFromLog(
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

    private fun getLogParserStrategyByInputFormat(formatName: InputFormatNames): LogParserStrategy = when (formatName) {
        GIT_LOG_NUMSTAT_RAW_REVERSED -> GitLogNumstatRawParserStrategy()
    }

    private fun readFileNameListFile(path: File, charset: Charset): List<String> {
        val inputStream: InputStream = path.inputStream()
        val lineList = mutableListOf<String>()

        // Read with the SAME charset resolved for the git-log, so the ls-files listing and the git-log
        // paths agree byte-for-byte. Unquote here too so a C-quoted path matches on both sides; otherwise
        // its file would silently lose its git metrics.
        inputStream.bufferedReader(charset).forEachLine { lineList.add(GitPathUnquoter.unquote(it)) }

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
        val encoding = determineLogEncoding(gitLogFile)
        if (!silent) error.println("Assumed encoding $encoding")
        val charset = Charset.forName(encoding)
        val namesInProject = readFileNameListFile(gitLsFile, charset)
        val lines: Stream<String> = Files.lines(gitLogFile.toPath(), charset)
        val projectConverter = ProjectConverter(containsAuthors)
        val logSizeInByte = gitLogFile.length()
        return GitLogProjectCreator(parserStrategy, metricsFactory, projectConverter, logSizeInByte, silent).parse(
            lines,
            namesInProject
        )
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if GitLogParser is applicable...")
        return ResourceSearchHelper.isFolderDirectlyInGivenDirectory(resourceToBeParsed, ".git")
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> = getAttributeDescriptors()
}
