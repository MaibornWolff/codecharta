package de.maibornwolff.codecharta.analysers.parsers.dependency

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.CommonAnalyserParameters
import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.ExtractionPipeline
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.output.DependencyProjectGenerator
import de.maibornwolff.codecharta.analysers.parsers.dependency.output.dependencyAttributeDescriptors
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.ProcessingPipeline
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.ProgressReporterFactory
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = DependencyParser.NAME,
    description = [DependencyParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class DependencyParser(private val input: InputStream = System.`in`, private val output: PrintStream = System.out) :
    CommonAnalyserParameters(),
    AnalyserInterface,
    AttributeGenerator {
    @CommandLine.Option(
        names = ["--include-tests"],
        description = [
            "analyse test files too (excluded by default, because a test depends on everything it " +
                "exercises and nothing depends on it, which shifts every level and cycle)"
        ]
    )
    private var includeTests = false

    @CommandLine.Option(
        names = ["--max-file-size"],
        description = ["skip files of at least this size in KB (default: no limit)"]
    )
    private var maxFileSizeKb: Int = SourceFileScanner.NO_FILE_SIZE_LIMIT

    @CommandLine.Option(
        names = ["--file-timeout"],
        description = [
            "give up on a file after this many seconds (default: no timeout). The parse itself is a " +
                "blocking native call, so the timeout skips the file's result while the parse runs to " +
                "completion in the background"
        ]
    )
    private var fileTimeoutSeconds: Int = ExtractionPipeline.NO_FILE_TIMEOUT

    @CommandLine.Option(
        names = ["--omit-graph-analysis"],
        description = [
            "emit dependencies only, skipping cycle detection and levelization. Both are superlinear, " +
                "so this is the escape hatch for a repository where they do not finish"
        ]
    )
    private var omitGraphAnalysis = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "dependencyparser"
        const val DESCRIPTION = "generates cc.json with a file-level dependency lens from source code"
    }

    override fun call(): Unit? {
        logExecutionStartedSyncSignal()

        val inputFile = inputFiles[extractNonPipedInputIndex(inputFiles)]
        require(InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            "Input invalid file for DependencyParser, stopping execution..."
        }

        require(baseFile == null && !localChanges) {
            "--base-file and --local-changes are not supported by the DependencyParser: " +
                "the dependency graph needs every file of the project, stopping execution..."
        }

        val context = resolveEffectiveInput(inputFile)
        try {
            val project = analyse(context.inputDir)
            ProjectSerializer.serializeToFileOrStream(project, context.resolveOutputFile(outputFile), output, compress)
        } finally {
            context.worktreeManager?.cleanup()
        }

        return null
    }

    private fun analyse(input: File): Project {
        val scanner =
            SourceFileScanner(
                allowedExtensions = fileExtensionsToAnalyse.ifEmpty { SupportedLanguage.allSuffixes() },
                excludePatterns = determineExclusionPatterns(ExtractionPipeline.analysisRootOf(input), !bypassGitignore),
                maxFileSizeKb = maxFileSizeKb,
                excludeTests = !includeTests
            )

        return ProgressReporterFactory.create(quiet = false).use { progressReporter ->
            val fileReports =
                ExtractionPipeline(scanner, progressReporter, fileTimeoutSeconds = fileTimeoutSeconds)
                    .run(input, bypassGitignore)
            val graph = ProcessingPipeline.run(fileReports, omitGraphAnalysis)
            DependencyProjectGenerator().generate(graph, analysedFilePaths(fileReports), resolvePipedProject())
        }
    }

    /**
     * The files that carry a node in the output, in the order the scan found them. A file whose parse
     * produced no declaration contributes no path, so the tree holds exactly the files the graph can
     * address.
     */
    private fun analysedFilePaths(fileReports: List<FileReport>): List<List<String>> = fileReports
        .flatMap { report -> report.nodes.map { it.physicalPath } }
        .distinct()
        .map { PathFactory.extractOSIndependentPath(it).edgesList }
        .filter { it.isNotEmpty() }

    private fun resolvePipedProject(): Project? {
        if (!shouldProcessPipedInput(inputFiles)) return null
        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject == null) {
            Logger.warn { "Skipping piped project..." }
        }
        return pipedProject
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> = dependencyAttributeDescriptors()

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        if (resourceToBeParsed.isBlank()) return false

        val searchFile = File(resourceToBeParsed.trim())
        if (searchFile.isFile) return SupportedLanguage.ofFileName(searchFile.name) != null
        if (!searchFile.isDirectory) return false

        return searchFile.walk().any { it.isFile && SupportedLanguage.ofFileName(it.name) != null }
    }
}
