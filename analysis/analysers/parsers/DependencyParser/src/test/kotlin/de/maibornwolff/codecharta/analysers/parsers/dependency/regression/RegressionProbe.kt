package de.maibornwolff.codecharta.analysers.parsers.dependency.regression

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.ExtractionPipeline
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DeclarationEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.FileDependencyEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.ProcessingPipeline
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.SilentProgressReporter
import de.maibornwolff.codecharta.util.CodeChartaConstants
import java.io.File

/**
 * A small project a reviewer once found a wrong or missing edge in, with the edges it must have: `expected.txt` holds
 * one line per correct file edge and leaf edge, `known-gaps.txt` how today's output deviates from it (see [KnownGaps]),
 * and lines starting with `#` say why. The sources lie in `src`, analysed like
 * `ccsh dependencyparser --include-tests --bypass-gitignore` does, build folders excluded unless `src` has a
 * `.gitignore`; a file that fails to analyse is a `failed` line.
 */
internal class RegressionProbe(private val directory: File) {
    /** What keeps this folder from being a probe; empty for a probe. */
    fun layoutProblems(): List<String> = listOfNotNull(
        "no $SOURCE_FOLDER folder".takeUnless { directory.resolve(SOURCE_FOLDER).isDirectory },
        "no $EXPECTED_FILE".takeUnless { directory.resolve(EXPECTED_FILE).isFile }
    )

    val knownGaps: KnownGaps by lazy { KnownGaps.parse(linesOf(KNOWN_GAPS_FILE)) }

    fun expectedLines(): List<String> = linesOf(EXPECTED_FILE)

    /** The lines the parser draws today: the expected ones without the known missing ones, plus the known wrong ones. */
    fun linesDrawnToday(): List<String> = (expectedLines() - knownGaps.missing + knownGaps.extra).sorted()

    fun actualLines(): List<String> = analyse()

    fun writeExpectedLines() {
        val expected = (actualLines() - knownGaps.extra + knownGaps.missing).sorted()
        directory.resolve(EXPECTED_FILE).writeText(expected.joinToString(separator = "\n", postfix = "\n"))
    }

    private fun linesOf(fileName: String): List<String> {
        val file = directory.resolve(fileName)
        return if (file.exists()) file.readLines().filter { it.isNotBlank() && !it.startsWith(COMMENT_PREFIX) } else emptyList()
    }

    private fun analyse(): List<String> {
        val sources = directory.resolve(SOURCE_FOLDER)
        val buildFolders = if (sources.resolve(GITIGNORE_FILE).exists()) emptyList() else CodeChartaConstants.BUILD_FOLDERS.toList()
        val excludePatterns = buildFolders + CodeChartaConstants.GIT_DIRECTORY_EXCLUDE_PATTERN
        val scanner = SourceFileScanner(allowedExtensions = SupportedLanguage.allSuffixes(), excludePatterns = excludePatterns)
        val extraction = ExtractionPipeline(scanner, SilentProgressReporter).run(sources, bypassGitignore = true)
        val graph = ProcessingPipeline.run(extraction.reports, omitGraphAnalysis = false)
        val failures = extraction.failures.map { "$FAILED_PREFIX${it.path}: ${it.cause}" }
        return (graph.edges.map { fileLine(it) } + graph.declarationEdges.map { leafLine(it) } + failures).sorted()
    }

    private fun fileLine(edge: FileDependencyEdge): String =
        "file ${edge.fromPath.joinToString("/")} -> ${edge.toPath.joinToString("/")}" + flags(edge.isCyclic, edge.isPointingUpwards)

    private fun leafLine(edge: DeclarationEdge): String {
        val from = edge.from.filePath.joinToString("/") + "#" + edge.from.key
        val to = edge.to.filePath.joinToString("/") + "#" + edge.to.key
        val usage = edge.usage.filterNot { it == PLAIN_USAGE }.joinToString(",").let { if (it.isEmpty()) "" else " usage=$it" }
        return "leaf $from -> $to$usage" + flags(edge.isCyclic, edge.isPointingUpwards)
    }

    private fun flags(isCyclic: Boolean, isPointingUpwards: Boolean): String =
        (if (isCyclic) " cyclic" else "") + (if (isPointingUpwards) " upward" else "")

    companion object {
        private const val SOURCE_FOLDER = "src"
        private const val EXPECTED_FILE = "expected.txt"
        private const val KNOWN_GAPS_FILE = "known-gaps.txt"
        private const val PLAIN_USAGE = "usage"
        private const val COMMENT_PREFIX = "#"
        private const val FAILED_PREFIX = "failed "
        private const val GITIGNORE_FILE = ".gitignore"

        /** Every folder one level below a language folder, as its path from [root]; each one must be a probe. */
        fun namesBelow(root: File): List<String> = root
            .listFiles { file -> file.isDirectory }
            .orEmpty()
            .flatMap { language -> language.listFiles { file -> file.isDirectory }.orEmpty().toList() }
            .map { it.relativeTo(root).invariantSeparatorsPath }
            .sorted()
    }
}
