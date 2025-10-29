package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

class ProjectScanner(
    private val root: File,
    private val projectBuilder: ProjectBuilder,
    private val excludePatterns: List<String> = listOf(),
    private val includeExtensions: List<String> = listOf(),
    private val baseFileNodes: Map<String, Node> = emptyMap(),
    private val useGitignore: Boolean = true
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private var ignoredFiles = 0L
    private val ignoredFileTypes = mutableSetOf<String>()
    private val filesSkipped = AtomicLong(0)
    private val filesAnalyzed = AtomicLong(0)

    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()
    private val fileMetrics = ConcurrentHashMap<String, MutableNode>()
    private val excludePatternRegex = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

    private val gitignoreHandler = GitignoreHandler(root)

    fun foundParsableFiles(): Boolean {
        return fileMetrics.isNotEmpty()
    }

    fun getIgnoredFiles(): Pair<Long, Set<String>> {
        return Pair(ignoredFiles, ignoredFileTypes)
    }

    fun getGitIgnoreStatistics(): Pair<Int, List<String>> {
        return if (useGitignore) gitignoreHandler.getStatistics() else Pair(0, emptyList())
    }

    fun getNotFoundFileExtensions(): Set<String> {
        val result = mutableSetOf<String>()
        for (extension in includeExtensions) {
            if (!fileMetrics.keys().toList().any { it.endsWith(extension) }) {
                result.add(extension)
            }
        }
        return result
    }

    fun traverseInputProject(verbose: Boolean) {
        runBlocking(Dispatchers.Default) {
            val parsableFiles = root.walk().filter { isParsableFile(it) }.toList()
            totalFiles = parsableFiles.size.toLong()

            parsableFiles.forEach { file ->
                launch {
                    filesParsed++
                    collectMetricsForFile(file, verbose)
                    if (!verbose) logProgress(file.name, filesParsed)
                }
            }
        }

        progressTracker.updateProgress(totalFiles, totalFiles, parsingUnit.name)
        System.err.println()

        if (baseFileNodes.isNotEmpty()) {
            logBaseFileStatistics()
        }

        if (verbose) {
            Logger.info { "Analysis of files complete, creating output file..." }
        }
        addAllNodesToProjectBuilder()
    }

    private fun collectMetricsForFile(file: File, verbose: Boolean) {
        val relativeFilePath = getRelativeFileName(file.toString())
        require(file.isFile) { "Expected file but found folder at $relativeFilePath!" }

        val fileContent = file.readText()
        val currentChecksum = ChecksumCalculator.calculateChecksum(fileContent)
        val baseNode = baseFileNodes[relativeFilePath]
        if (baseNode != null && baseNode.checksum == currentChecksum) {
            reuseMetricsFromBaseFile(baseNode, relativeFilePath, verbose)
        } else {
            applyLanguageSpecificCollector(file, fileContent, relativeFilePath, verbose)
        }
    }

    private fun reuseMetricsFromBaseFile(baseNode: Node, relativeFilePath: String, verbose: Boolean) {
        if (verbose) Logger.info { "Reusing metrics for unchanged file $relativeFilePath" }
        fileMetrics[relativeFilePath] = MutableNode(
            name = baseNode.name,
            type = baseNode.type,
            attributes = baseNode.attributes,
            checksum = baseNode.checksum
        )
        filesSkipped.incrementAndGet()
    }

    private fun applyLanguageSpecificCollector(file: File, fileContent: String, relativeFilePath: String, verbose: Boolean) {
        if (verbose) Logger.info { "Calculating metrics for file $relativeFilePath" }

        val collector = findCollectorForFileType(file.extension)?.collectorFactory
        require(collector != null) { "Unexpectedly encountered an unsupported file at $relativeFilePath!" }

        fileMetrics[relativeFilePath] = collector().collectMetricsForFile(file, fileContent)
        filesAnalyzed.incrementAndGet()
    }

    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun isParsableFile(file: File): Boolean {
        if (!file.isFile) return false

        if (useGitignore && gitignoreHandler.shouldExclude(file)) return false

        if (isPathExcluded(file) || !isFileExtensionIncluded(file.extension)) return false

        return if (findCollectorForFileType(file.extension) != null) {
            true
        } else {
            ignoredFileTypes += file.extension
            ignoredFiles++
            false
        }
    }

    private fun isPathExcluded(file: File): Boolean {
        return this.excludePatterns.isNotEmpty() && excludePatternRegex.containsMatchIn("/" + getRelativeFileName(file.toString()))
    }

    private fun isFileExtensionIncluded(fileExtension: String): Boolean {
        return includeExtensions.isEmpty() || includeExtensions.contains(fileExtension)
    }

    private fun findCollectorForFileType(fileExtension: String): AvailableCollectors? {
        return AvailableCollectors.entries.find {
            val extension = ".$fileExtension"
            it.fileExtension.primaryExtension == extension || it.fileExtension.otherValidExtensions.contains(extension)
        }
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }

    private fun logBaseFileStatistics() {
        val skipped = filesSkipped.get()
        val analyzed = filesAnalyzed.get()
        val total = skipped + analyzed
        Logger.info {
            "Checksum comparison: $skipped files skipped, $analyzed files analyzed " +
                "(${skipped * 100 / total.coerceAtLeast(1)}% reused)"
        }
    }

    private fun addAllNodesToProjectBuilder() {
        val sortedFileMetrics = fileMetrics.entries.sortedBy { (relativePath, _) -> relativePath }
        for ((relativePath, node) in sortedFileMetrics) {
            val path = PathFactory.fromFileSystemPath(relativePath).parent
            projectBuilder.insertByPath(path, node)
        }
    }
}
