package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeResolverStrategy
import de.maibornwolff.codecharta.analysers.filters.mergefilter.ProjectMerger
import de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges.CommitChangesScan
import de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership.AuthorOwnershipScan
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import java.time.LocalDate
import kotlin.io.path.createTempDirectory

private data class ParserSelection(val parsers: List<ConfiguredAnalyser>, val skipped: List<SkippedSource>)

private data class MappedCodebase(val project: Project, val mappedHistories: List<VersionControl>, val failedHistories: List<SkippedSource>)

class CodebaseAnalysis(
    private val console: AnalysisConsole,
    private val svnLogWriter: SvnLogWriter,
    private val createParsers: (SharedFileLoop?) -> List<AnalyserInterface>
) {
    fun run(request: AnalyseRequest) {
        val workFolder = createTempDirectory(WORK_FOLDER_PREFIX).toFile()
        try {
            val selection = console.whileAnalysing { selectParsers(request) }
            val search = console.whileAnalysing { HistoryFinder(svnLogWriter).find(request, workFolder) }
            val sources = (selection.parsers.map { it.analyser.name } + search.histories.map { it.versionControl.sourceName })
                .joinToString()
            console.printInPlaceOfAnalyserOutput("Analysing ${request.projectFolder.path} with $sources ...")
            val mapped = console.whileAnalysing { analyse(request, selection.parsers, search.histories) }
            writeMap(mapped.project, request)
            console.printSeparated("Analysis done: ${countedFiles(mapped.project)} with $sources")
            console.println("Map: ${request.outputFile.path}")
            printSkipped(selection.skipped + inHistoryOrder(search.skipped + mapped.failedHistories))
            if (request.authorOwnership && mapped.project.lenses.clusters.carriesData) printOwnershipHints(request, mapped.project)
            request.commitChangesSince?.let { printCommitChangesHints(request, it, mapped) }
        } finally {
            workFolder.deleteRecursively()
        }
    }

    // Parsers share their parses only when they run at the same time, see SharedFileLoop
    private fun selectParsers(request: AnalyseRequest): ParserSelection {
        val sharedFileLoop = SharedFileLoop().takeIf { request.parallel }
        val parsers = createParsers(sharedFileLoop)
        val skipped = parsers.mapNotNull { parser -> whySkipped(parser, request)?.let { SkippedSource(parser.name, it) } }
        skipped.forEach { sharedFileLoop?.leave(it.name) }
        val applicable = parsers.filter { parser -> skipped.none { it.name == parser.name } }
        if (applicable.isEmpty()) throw AnalysisException("No parser applies to ${request.projectFolder.path}, so there is nothing to map.")
        val arguments = excludePatternsFor(request).map { "--exclude=$it" } + listOfNotNull(LOCAL_CHANGES.takeIf { request.localChanges })
        val configured = applicable.map { parser ->
            ConfiguredAnalyser(parser, arguments, whenDone = { sharedFileLoop?.leave(parser.name) })
        }
        return ParserSelection(configured, skipped)
    }

    private fun whySkipped(parser: AnalyserInterface, request: AnalyseRequest): String? = when {
        parser.name in request.leftOut -> SkippedSource.LEFT_OUT_REASON
        request.localChanges && parser.name in CodeParsers.needingEveryFile ->
            "left out with $LOCAL_CHANGES, ${CodeParsers.needingEveryFile.getValue(parser.name)}"
        !parser.isApplicable(request.analysedFolder.path) -> "found no file it reads in ${request.projectFolder.path}"
        else -> null
    }

    private fun excludePatternsFor(request: AnalyseRequest): List<String> {
        val svnFolder = VersionControl.SVN_FOLDER_EXCLUDE_PATTERN.takeIf { VersionControl.SVN.isRootOf(request.analysedFolder) }
        return request.excludePatterns + listOfNotNull(svnFolder)
    }

    private fun analyse(request: AnalyseRequest, parsers: List<ConfiguredAnalyser>, histories: List<History>): MappedCodebase {
        val analysers = parsers + histories.map { it.analyser }
        val results = ProjectAnalyser().analyseEach(request.analysedFolder, analysers, request.outputFile, request.parallel)
        val resultOf = analysers.zip(results).toMap()
        val code = merge(parsers.map { resultOf.getValue(it).getOrThrow() })
        val historyResults = histories.map { it to resultOf.getValue(it.analyser) }
        val historyProjects = historyResults.mapNotNull { (_, result) -> result.getOrNull() }.map { HistoryFilter.keepFilesOf(code, it) }
        val mappedHistories = historyResults.filter { (_, result) -> result.isSuccess }.map { (history, _) -> history.versionControl }
        val failedHistories = historyResults.mapNotNull { (history, result) ->
            result.exceptionOrNull()?.let { history.versionControl.skipped(it.message.orEmpty()) }
        }
        return MappedCodebase(merge(listOf(code) + historyProjects), mappedHistories, failedHistories)
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

    private fun printOwnershipHints(request: AnalyseRequest, project: Project) {
        if (AuthorOwnershipScan(request.analysedFolder).isShallowClone()) console.println(AuthorOwnershipScan.SHALLOW_CLONE_WARNING)
        val carriesRealNames = AuthorOwnershipScan.carriesRealNames(project.lenses.clusters)
        console.println(if (carriesRealNames) AuthorOwnershipScan.REAL_NAMES_WARNING else AuthorOwnershipScan.PERSONAL_DATA_NOTE)
    }

    private fun printCommitChangesHints(request: AnalyseRequest, since: LocalDate, mapped: MappedCodebase) {
        if (VersionControl.GIT !in mapped.mappedHistories) {
            console.println(COMMIT_CHANGES_NEED_HISTORY_HINT)
            return
        }
        if (CommitChangesScan(request.analysedFolder, since).isShallowClone()) console.println(CommitChangesScan.SHALLOW_CLONE_WARNING)
        val carriesCommitChanges = CommitChangesScan.carriesCommitChanges(mapped.project.lenses.clusters)
        console.println(if (carriesCommitChanges) CommitChangesScan.PERSONAL_DATA_NOTE else CommitChangesScan.noCommitHint(since))
    }

    private fun countedFiles(project: Project): String {
        val count = project.rootNode.nodes.values.count { it.type == NodeType.File }
        return if (count == 1) "1 file" else "$count files"
    }

    companion object {
        internal const val COMMIT_CHANGES_NEED_HISTORY_HINT =
            "No commit changes: ${CommitChangesScan.FLAG} needs the git history, which is not in the map."
        private const val WORK_FOLDER_PREFIX = "codecharta-analyse"
        private const val LOCAL_CHANGES = "--local-changes"
    }
}
