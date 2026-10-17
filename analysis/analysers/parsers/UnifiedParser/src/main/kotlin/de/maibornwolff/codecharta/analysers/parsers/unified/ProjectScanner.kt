package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailedFile
import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.analysers.analyserinterface.scan.UndecodableFileName
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import de.maibornwolff.treesitter.excavationsite.api.isUnusableParser
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicLong

class ProjectScanner(
    private val root: File,
    private val projectBuilder: ProjectBuilder,
    private val excludePatterns: List<String> = listOf(),
    private val includeExtensions: List<String> = listOf(),
    private val baseFileNodes: Map<String, Node> = emptyMap(),
    private val useGitignore: Boolean = true,
    private val localChangesFiles: Set<String> = emptySet(),
    private val fileMeasurer: FileMeasurer = CollectorMeasurer
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private var ignoredFiles = 0L
    private val ignoredFileTypes = mutableSetOf<String>()
    private val filesSkipped = AtomicLong(0)
    private val filesAnalyzed = AtomicLong(0)
    private val failures = ConcurrentLinkedQueue<FailedFile>()

    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()
    private val fileMetrics = ConcurrentHashMap<String, MutableNode>()
    private val excludePatternRegex = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

    private val gitignoreHandler = GitignoreHandler(root)

    fun foundParsableFiles(): Boolean = fileMetrics.isNotEmpty()

    fun measuredAttributes(): Set<String> = fileMetrics.values.flatMap { it.attributes.keys }.toSet()

    fun getIgnoredFiles(): Pair<Long, Set<String>> = Pair(ignoredFiles, ignoredFileTypes)

    /** The files whose analysis failed, relative to the root; they are missing from the output. */
    fun failures(): List<FailedFile> = failures.sortedBy { it.path }

    fun getGitIgnoreStatistics(): Pair<Int, List<String>> = if (useGitignore) gitignoreHandler.getStatistics() else Pair(0, emptyList())

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
            val parsableFiles = root
                .walkTopDown()
                .onEnter { dir -> !shouldSkipDirectory(dir) }
                .filter { isParsableFile(it) }
                .toList()
            totalFiles = parsableFiles.size.toLong()

            parsableFiles.forEach { file ->
                launch {
                    filesParsed++
                    collectMetricsSkippingFailure(file, verbose)
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

    // A file that fails is left out, so one file cannot stop the analysis of a project; the failures are reported
    // together afterwards. A grammar that fits no file of its language stops the analysis instead.
    private fun collectMetricsSkippingFailure(file: File, verbose: Boolean) {
        try {
            collectMetricsForFile(file, verbose)
        } catch (cancellation: CancellationException) {
            throw cancellation
        } catch (failure: Exception) {
            if (isUnusableParser(failure)) throw failure
            val relativeFilePath = getRelativeFileName(file.toString())
            Logger.debug(failure) { "Failed to analyze $relativeFilePath: ${failure.message}" }
            failures.add(FailedFile(relativeFilePath, failure))
        }
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

        fileMetrics[relativeFilePath] = fileMeasurer.measure(file, fileContent)
        filesAnalyzed.incrementAndGet()
    }

    private fun getRelativeFileName(fileName: String): String = root
        .toPath()
        .toAbsolutePath()
        .relativize(Paths.get(fileName).toAbsolutePath())
        .toString()
        .replace('\\', '/')

    private fun shouldSkipDirectory(dir: File): Boolean {
        if (!dir.isDirectory) return false
        return (useGitignore && gitignoreHandler.shouldExclude(dir))
    }

    private fun isParsableFile(file: File): Boolean {
        if (UndecodableFileName.reportIfUndecodable(file) || !file.isFile) return false

        if (useGitignore && gitignoreHandler.shouldExclude(file)) return false

        val relativePath = getRelativeFileName(file.toString())

        if (localChangesFiles.isNotEmpty() && !localChangesFiles.contains(relativePath)) return false

        if (isPathExcluded(relativePath) || !isFileExtensionIncluded(file.extension)) return false

        return if (AvailableCollectors.forExtension(file.extension) != null) {
            true
        } else {
            ignoredFileTypes += file.extension
            ignoredFiles++
            false
        }
    }

    private fun isPathExcluded(relativePath: String): Boolean =
        this.excludePatterns.isNotEmpty() && excludePatternRegex.containsMatchIn("/$relativePath")

    private fun isFileExtensionIncluded(fileExtension: String): Boolean =
        includeExtensions.isEmpty() || includeExtensions.contains(fileExtension)

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
