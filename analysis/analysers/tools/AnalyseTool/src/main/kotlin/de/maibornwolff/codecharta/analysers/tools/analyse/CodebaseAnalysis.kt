package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserrunner.AnalysisConsole
import de.maibornwolff.codecharta.analysers.analyserrunner.AnalysisException
import de.maibornwolff.codecharta.analysers.analyserrunner.ConfiguredAnalyser
import de.maibornwolff.codecharta.analysers.analyserrunner.ProjectAnalyser
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeResolverStrategy
import de.maibornwolff.codecharta.analysers.filters.mergefilter.ProjectMerger
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import kotlin.io.path.createTempDirectory

data class AnalyseRequest(
    val projectFolder: File,
    val outputFile: File,
    val excludePatterns: List<String> = emptyList(),
    val leftOut: Set<String> = emptySet(),
    val parallel: Boolean = false,
    val compress: Boolean = true
)

private data class ParserSelection(val parsers: List<ConfiguredAnalyser>, val skipped: List<SkippedSource>)

private data class MappedCodebase(val project: Project, val failedHistories: List<SkippedSource>)

class CodebaseAnalysis(
    private val console: AnalysisConsole,
    private val svnLogWriter: SvnLogWriter,
    private val createParsers: () -> List<AnalyserInterface>
) {
    fun run(request: AnalyseRequest) {
        val workFolder = createTempDirectory(WORK_FOLDER_PREFIX).toFile()
        try {
            val selection = console.whileAnalysing { selectParsers(request) }
            val search = console.whileAnalysing { HistoryFinder(svnLogWriter).find(request.projectFolder, request.leftOut, workFolder) }
            val sources = (selection.parsers.map { it.analyser.name } + search.histories.map { it.versionControl.sourceName })
                .joinToString()
            console.printInPlaceOfAnalyserOutput("Analysing ${request.projectFolder.path} with $sources ...")
            val mapped = console.whileAnalysing { analyse(request, selection.parsers, search.histories) }
            writeMap(mapped.project, request)
            console.printSeparated("Analysis done: ${countedFiles(mapped.project)} with $sources")
            console.println("Map: ${request.outputFile.path}")
            printSkipped(selection.skipped + inHistoryOrder(search.skipped + mapped.failedHistories))
        } finally {
            workFolder.deleteRecursively()
        }
    }

    private fun selectParsers(request: AnalyseRequest): ParserSelection {
        val parsers = createParsers()
        val skipped = parsers.mapNotNull { parser -> whySkipped(parser, request)?.let { SkippedSource(parser.name, it) } }
        val applicable = parsers.filter { parser -> skipped.none { it.name == parser.name } }
        if (applicable.isEmpty()) throw AnalysisException("No parser applies to ${request.projectFolder.path}, so there is nothing to map.")
        val excludeArguments = excludePatternsFor(request).map { "--exclude=$it" }
        return ParserSelection(applicable.map { ConfiguredAnalyser(it, excludeArguments) }, skipped)
    }

    private fun whySkipped(parser: AnalyserInterface, request: AnalyseRequest): String? = when {
        parser.name in request.leftOut -> SkippedSource.LEFT_OUT_REASON
        !parser.isApplicable(request.projectFolder.path) -> "found no file it reads in ${request.projectFolder.path}"
        else -> null
    }

    private fun excludePatternsFor(request: AnalyseRequest): List<String> {
        val svnFolder = VersionControl.SVN_FOLDER_EXCLUDE_PATTERN.takeIf { VersionControl.SVN.isRootOf(request.projectFolder) }
        return request.excludePatterns + listOfNotNull(svnFolder)
    }

    private fun analyse(request: AnalyseRequest, parsers: List<ConfiguredAnalyser>, histories: List<History>): MappedCodebase {
        val analysers = parsers + histories.map { it.analyser }
        val results = ProjectAnalyser().analyseEach(request.projectFolder, analysers, request.outputFile, request.parallel)
        val resultOf = analysers.zip(results).toMap()
        val code = merge(parsers.map { resultOf.getValue(it).getOrThrow() })
        val historyResults = histories.map { it to resultOf.getValue(it.analyser) }
        val historyProjects = historyResults.mapNotNull { (_, result) -> result.getOrNull() }.map { HistoryFilter.keepFilesOf(code, it) }
        val failedHistories = historyResults.mapNotNull { (history, result) ->
            result.exceptionOrNull()?.let { history.versionControl.skipped(it.message.orEmpty()) }
        }
        return MappedCodebase(merge(listOf(code) + historyProjects), failedHistories)
    }

    private fun merge(projects: List<Project>): Project =
        projects.singleOrNull() ?: ProjectMerger(projects, MergeResolverStrategy.recursive()).merge()

    private fun writeMap(project: Project, request: AnalyseRequest) {
        request.outputFile.absoluteFile.parentFile.mkdirs()
        console.whileAnalysing {
            ProjectSerializer.serializeToFileOrStream(
                project,
                request.outputFile.path,
                console.output,
                request.compress
            )
        }
    }

    private fun inHistoryOrder(skipped: List<SkippedSource>): List<SkippedSource> {
        val historyOrder = VersionControl.entries.map { it.sourceName }
        return skipped.sortedBy { historyOrder.indexOf(it.name) }
    }

    private fun printSkipped(skipped: List<SkippedSource>) {
        if (skipped.isEmpty()) return
        console.println("Not in the map:")
        skipped.forEach { console.println("  ${it.name}: ${it.reason}") }
    }

    private fun countedFiles(project: Project): String {
        val count = project.rootNode.nodes.values.count { it.type == NodeType.File }
        return if (count == 1) "1 file" else "$count files"
    }

    companion object {
        private const val WORK_FOLDER_PREFIX = "codecharta-analyse"
    }
}
