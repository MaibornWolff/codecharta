package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.CommonAnalyserParameters
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
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
import java.io.FileInputStream
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

        if (!includeBuildFolders) patternsToExclude += CodeChartaConstants.BUILD_FOLDERS

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
        val projectScanner = ProjectScanner(inputFile, projectBuilder, patternsToExclude, fileExtensionsToAnalyse, baseFileNodeMap)
        projectScanner.traverseInputProject(verbose)

        val notFoundButSpecifiedFormats = projectScanner.getNotFoundFileExtensions()
        if (notFoundButSpecifiedFormats.isNotEmpty()) {
            System.err.println(
                "From the specified file extensions to parse, " +
                    "[${formatFileExtensions(notFoundButSpecifiedFormats)}] " +
                    "were not found in the given input!"
            )
        }

        val (nrIgnoredFiles, ignoredFileTypes) = projectScanner.getIgnoredFiles()
        if (ignoredFileTypes.isNotEmpty()) {
            System.err.println(
                "$nrIgnoredFiles Files with the following extensions were ignored as " +
                    "they are currently not supported:\n[${formatFileExtensions(ignoredFileTypes)}]"
            )
        }

        if (!projectScanner.foundParsableFiles()) {
            println()
            Logger.warn { "No files with specified file extension(s) were found within the given folder - generating empty output file!" }
        }

        val executionTimeMs = System.currentTimeMillis() - startTime
        val formattedTime = formatTime(executionTimeMs.milliseconds)
        System.err.println("\nUnifiedParser completed in $formattedTime, building project...")

        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())

        return projectBuilder.build()
    }

    private fun extractPipedProject(input: InputStream): Project? {
        while (input.available() == 0) Thread.sleep(100)

        return ProjectDeserializer.deserializeProject(input)
    }

    private fun loadBaseFileNodes(): Map<String, Node> {
        if (baseFile == null) {
            return emptyMap()
        }

        if (!baseFile!!.exists()) {
            Logger.warn { "Base file '${baseFile!!.absolutePath}' does not exist, continuing with normal analysis... " }
            return emptyMap()
        }

        return try {
            val baseProject = ProjectDeserializer.deserializeProject(FileInputStream(baseFile!!))
            val nodeMap = mutableMapOf<String, Node>()
            extractFileNodesWithPaths(baseProject.rootNode, "", nodeMap)
            Logger.info { "Loaded ${nodeMap.size} file nodes from base file for checksum comparison" }
            nodeMap
        } catch (e: Exception) {
            Logger.warn { "Failed to load base file: ${e.message}" }
            emptyMap()
        }
    }

    private fun extractFileNodesWithPaths(node: Node, currentPath: String, nodeMap: MutableMap<String, Node>) {
        // Skip the root node name to match the relative paths generated in ProjectScanner
        val nodePath = if (currentPath.isEmpty() && node.name == "root") {
            ""
        } else if (currentPath.isEmpty()) {
            node.name
        } else {
            "$currentPath/${node.name}"
        }

        if (node.type == NodeType.File && node.checksum != null) {
            nodeMap[nodePath] = node
        }

        node.children.forEach { child ->
            extractFileNodesWithPaths(child, nodePath, nodeMap)
        }
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
