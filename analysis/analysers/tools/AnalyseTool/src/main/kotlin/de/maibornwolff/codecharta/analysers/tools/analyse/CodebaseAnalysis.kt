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

private data class MappedCodebase(val project: Project, val missingHistories: List<String>)

class CodebaseAnalysis(
    private val console: AnalysisConsole,
    private val svnLogWriter: SvnLogWriter,
    private val createParsers: () -> List<AnalyserInterface>
) {
    fun run(request: AnalyseRequest) {
        val workFolder = createTempDirectory(WORK_FOLDER_PREFIX).toFile()
        try {
            val parsers = console.whileAnalysing { applicableParsers(request) }
            val search = console.whileAnalysing { findHistories(request, workFolder) }
            val sources = (parsers.map { it.analyser.name } + search.histories.map { "${it.versionControl.label} history" }).joinToString()
            console.printInPlaceOfAnalyserOutput("Analysing ${request.projectFolder.path} with $sources ...")
            val mapped = console.whileAnalysing { analyse(request, parsers, search.histories) }
            writeMap(mapped.project, request)
            console.printSeparated("Analysis done: ${countedFiles(mapped.project)} with $sources")
            console.println("Map: ${request.outputFile.path}")
            (search.hints + mapped.missingHistories).forEach(console::println)
        } finally {
            workFolder.deleteRecursively()
        }
    }

    private fun applicableParsers(request: AnalyseRequest): List<ConfiguredAnalyser> {
        val folder = request.projectFolder
        val parsers = createParsers().filter { it.name !in request.leftOut && it.isApplicable(folder.path) }
        if (parsers.isEmpty()) throw AnalysisException("No parser applies to ${folder.path}, so there is nothing to map.")
        val excludeArguments = excludePatternsFor(request).map { "--exclude=$it" }
        return parsers.map { ConfiguredAnalyser(it, excludeArguments) }
    }

    private fun excludePatternsFor(request: AnalyseRequest): List<String> {
        val svnFolder = VersionControl.SVN_FOLDER_EXCLUDE_PATTERN.takeIf { VersionControl.SVN.isRootOf(request.projectFolder) }
        return request.excludePatterns + listOfNotNull(svnFolder)
    }

    private fun findHistories(request: AnalyseRequest, workFolder: File): HistorySearch {
        val wanted = VersionControl.entries.filter { it.label !in request.leftOut }
        return HistoryFinder(svnLogWriter).find(request.projectFolder, wanted, workFolder)
    }

    private fun analyse(request: AnalyseRequest, parsers: List<ConfiguredAnalyser>, histories: List<History>): MappedCodebase {
        val analysers = parsers + histories.map { it.analyser }
        val results = ProjectAnalyser().analyseEach(request.projectFolder, analysers, request.outputFile, request.parallel)
        val code = merge(results.take(parsers.size).map { it.getOrThrow() })
        val historyResults = histories.zip(results.drop(parsers.size))
        val historyProjects = historyResults.mapNotNull { (_, result) -> result.getOrNull() }.map { HistoryFilter.keepFilesOf(code, it) }
        val missingHistories = historyResults.mapNotNull { (history, result) ->
            result.exceptionOrNull()?.let { history.versionControl.missingHistory(it.message.orEmpty()) }
        }
        return MappedCodebase(merge(listOf(code) + historyProjects), missingHistories)
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

    private fun countedFiles(project: Project): String {
        val count = project.rootNode.nodes.values.count { it.type == NodeType.File }
        return if (count == 1) "1 file" else "$count files"
    }

    companion object {
        private const val WORK_FOLDER_PREFIX = "codecharta-analyse"
    }
}
