package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.CommonAnalyserParameters
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds

@CommandLine.Command(
    name = UnifiedParser.NAME,
    description = [UnifiedParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class UnifiedParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator, CommonAnalyserParameters() {
    @CommandLine.Option(
        names = ["--bypass-gitignore"],
        description = ["bypass .gitignore files and use regex-based exclusion instead (default: false)"]
    )
    private var bypassGitignore = false

    companion object {
        const val NAME = "unifiedparser"
        const val DESCRIPTION = "generates cc.json from projects or source code files"
    }

    override val name = NAME
    override val description = DESCRIPTION

    override fun call(): Unit? {
        val inputFileIndex = extractNonPipedInputIndex(inputFiles)
        val inputFile = inputFiles[inputFileIndex]

        require(InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            "Input invalid file for UnifiedParser, stopping execution..."
        }

        var project = scanInputProject(inputFiles[inputFileIndex])

        if (shouldProcessPipedInput(inputFiles)) {
            val pipedProject = extractPipedProject(input)
            if (pipedProject != null) {
                project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
            } else {
                Logger.warn { "Skipping piped project..." }
            }
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun scanInputProject(inputFile: File): Project {
        val startTime = System.currentTimeMillis()
        val projectBuilder = ProjectBuilder()
        val baseFileNodeMap = loadBaseFileNodes()
        val useGitignore = !bypassGitignore

        val effectivePatternsToExclude = determineExclusionPatterns(inputFile, useGitignore)
        val projectScanner = ProjectScanner(
            inputFile,
            projectBuilder,
            effectivePatternsToExclude,
            fileExtensionsToAnalyse,
            baseFileNodeMap,
            useGitignore
        )

        projectScanner.traverseInputProject(verbose)

        reportNotFoundFileExtensions(projectScanner)
        reportIgnoredFileTypes(projectScanner)
        reportGitIgnoreStatistics(projectScanner)
        reportNoParsableFiles(projectScanner)

        val executionTimeMs = System.currentTimeMillis() - startTime
        val formattedTime = formatTime(executionTimeMs.milliseconds)
        System.err.println("UnifiedParser completed in $formattedTime, building project...")

        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())

        return projectBuilder.build()
    }

    private fun reportNotFoundFileExtensions(projectScanner: ProjectScanner) {
        val notFoundButSpecifiedFormats = projectScanner.getNotFoundFileExtensions()
        if (notFoundButSpecifiedFormats.isNotEmpty()) {
            System.err.println(
                "From the specified file extensions to parse, " +
                    "[${formatFileExtensions(notFoundButSpecifiedFormats)}] " +
                    "were not found in the given input!"
            )
        }
    }

    private fun reportIgnoredFileTypes(projectScanner: ProjectScanner) {
        val (nrIgnoredFiles, ignoredFileTypes) = projectScanner.getIgnoredFiles()
        if (ignoredFileTypes.isNotEmpty()) {
            System.err.println(
                "$nrIgnoredFiles Files with the following extensions were ignored as " +
                    "they are currently not supported:\n[${formatFileExtensions(ignoredFileTypes)}]"
            )
        }
    }

    private fun reportGitIgnoreStatistics(projectScanner: ProjectScanner) {
        val (gitignoreExcludedCount, gitignoreFiles) = projectScanner.getGitIgnoreStatistics()
        if (!bypassGitignore && gitignoreExcludedCount > 0) {
            Logger.info { "$gitignoreExcludedCount files were excluded by .gitignore rules" }
            if (verbose && gitignoreFiles.isNotEmpty()) {
                System.err.println("Found .gitignore files at:")
                gitignoreFiles.forEach { System.err.println("  - $it") }
            }
        }
    }

    private fun reportNoParsableFiles(projectScanner: ProjectScanner) {
        if (!projectScanner.foundParsableFiles()) {
            println()
            Logger.warn { "No files with specified file extension(s) were found within the given folder - generating empty output file!" }
        }
    }

    private fun extractPipedProject(input: InputStream): Project? {
        while (input.available() == 0) Thread.sleep(100)

        return ProjectDeserializer.deserializeProject(input)
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if UnifiedParser is applicable...")
        return ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(
            resourceToBeParsed,
            AvailableCollectors.entries.map { it.fileExtension }
        )
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }

    private fun determineExclusionPatterns(inputFile: File, useGitignore: Boolean): List<String> {
        val excludePatterns = specifiedExcludePatterns.toMutableList()
        val rootGitignoreExists = File(inputFile, ".gitignore").exists()

        if (useGitignore && !rootGitignoreExists) {
            Logger.warn { "No .gitignore found at root level, excluding common build folders as fallback..." }
        }

        if (!includeBuildFolders && !rootGitignoreExists) {
            excludePatterns.addAll(CodeChartaConstants.BUILD_FOLDERS)
        }

        return excludePatterns
    }

    private fun formatFileExtensions(fileExtensions: Set<String>): String {
        return fileExtensions.joinToString(separator = ", ") { ".$it" }
    }

    private fun formatTime(duration: Duration): String {
        val totalSeconds = duration.inWholeSeconds
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = duration.inWholeMilliseconds / 1000.0 % 60

        return when {
            hours > 0 -> String.format(java.util.Locale.US, "%d:%02d:%05.2f", hours, minutes, seconds)
            minutes > 0 -> String.format(java.util.Locale.US, "%d:%05.2f", minutes, seconds)
            else -> String.format(java.util.Locale.US, "%.2f seconds", seconds)
        }
    }
}
