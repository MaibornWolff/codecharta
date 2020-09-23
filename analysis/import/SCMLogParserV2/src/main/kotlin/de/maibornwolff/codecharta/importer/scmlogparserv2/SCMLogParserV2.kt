package de.maibornwolff.codecharta.importer.scmlogparserv2

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.scmlogparserv2.InputFormatNames.GIT_LOG
import de.maibornwolff.codecharta.importer.scmlogparserv2.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.mozilla.universalchardet.UniversalDetector
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.nio.charset.Charset
import java.nio.file.Files
import java.util.Arrays
import java.util.concurrent.Callable
import java.util.stream.Stream

@CommandLine.Command(
    name = "scmlogparserv2",
    description = ["EXPERIMENTAL git log parser - generates cc.json from git log file"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class SCMLogParserV2(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(
        names = ["-n", "--file-name-list"],
        arity = "1",
        paramLabel = "FILE",
        description = ["list of all file names in current git project"]
    )
    private var nameFile: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

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
                GIT_LOG -> MetricsFactory(nonChurnMetrics)
                else -> MetricsFactory()
            }
        }

    @Throws(IOException::class)
    override fun call(): Void? {

        print(" ")
        var project = createProjectFromLog(
            file!!,
            nameFile!!,
            logParserStrategy,
            metricsFactory,
            addAuthor,
            silent
        )

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }
        if (outputFile.isNotEmpty()) {
            if (compress) ProjectSerializer.serializeAsCompressedFile(
                project,
                outputFile
            ) else ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile)
        } else {
            ProjectSerializer.serializeProject(project, OutputStreamWriter(output))
        }

        return null
    }

    private fun getLogParserStrategyByInputFormat(formatName: InputFormatNames): LogParserStrategy {
        return when (formatName) {
            GIT_LOG -> GitLogNumstatRawParserStrategy()
        }
    }

    private fun readFileNameListFile(path: File): MutableList<String> {
        val inputStream: InputStream = path.inputStream()
        val lineList = mutableListOf<String>()

        inputStream.bufferedReader().forEachLine { lineList.add(it) }

        return lineList
    }

    private fun createProjectFromLog(
        pathToLog: File,
        pathToNameTree: File,
        parserStrategy: LogParserStrategy,
        metricsFactory: MetricsFactory,
        containsAuthors: Boolean,
        silent: Boolean = false
    ): Project {
        val namesInProject = readFileNameListFile(pathToNameTree)
        val encoding = guessEncoding(pathToLog) ?: "UTF-8"
        if (!silent) error.println("Assumed encoding $encoding")
        val lines: Stream<String> = Files.lines(pathToLog.toPath(), Charset.forName(encoding))
        val projectConverter = ProjectConverter(containsAuthors)
        return SCMLogProjectCreator(parserStrategy, metricsFactory, projectConverter, silent).parse(
            lines,
            namesInProject
        )
    }

    // not implemented yet #738
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
                    launch {
                        println(String.format(infoFormat, it.metricName(), it.description()))
                    }
                }
        }
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SCMLogParserV2(), System.out, *args)
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
