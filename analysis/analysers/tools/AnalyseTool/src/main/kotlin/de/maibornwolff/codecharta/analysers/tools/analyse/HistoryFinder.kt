package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.parsers.gitlog.RepoScanCommand
import de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership.AuthorOwnershipScan
import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser
import java.io.File

data class History(val versionControl: VersionControl, val analyser: ConfiguredAnalyser)

data class HistorySearch(val histories: List<History>, val skipped: List<SkippedSource>)

class HistoryFinder(private val svnLogWriter: SvnLogWriter, private val homeFolder: File = File(System.getProperty("user.home"))) {
    fun find(request: AnalyseRequest, workFolder: File): HistorySearch {
        val lookups = VersionControl.entries.map { versionControl -> lookUp(versionControl, request, workFolder) }
        return HistorySearch(lookups.mapNotNull { it.history }, lookups.mapNotNull { it.skipped })
    }

    private class Lookup(val history: History? = null, val skipped: SkippedSource? = null)

    private fun lookUp(versionControl: VersionControl, request: AnalyseRequest, workFolder: File): Lookup = when {
        versionControl.label in request.leftOut -> Lookup(skipped = versionControl.skipped(SkippedSource.LEFT_OUT_REASON))
        request.commitHash != null && versionControl == VersionControl.SVN -> Lookup(skipped = versionControl.skipped(AT_COMMIT_REASON))
        versionControl.isRootOf(request.projectFolder) -> historyOf(versionControl, request, workFolder)
        else -> Lookup(skipped = versionControl.skipped(whyNotRootOf(versionControl, request.projectFolder)))
    }

    private fun whyNotRootOf(versionControl: VersionControl, projectFolder: File): String {
        val folder = projectFolder.path
        val otherHistory = VersionControl.entries.firstOrNull { it.isRootOf(projectFolder) }
        if (otherHistory != null) return "$folder keeps its history in ${otherHistory.label}"
        val root = versionControl.enclosingRootOf(projectFolder, homeFolder)
            ?: return "no ${versionControl.label} ${versionControl.checkout} found for $folder"
        return "$folder is inside the ${versionControl.label} ${versionControl.checkout} ${root.path}, not at its root. " +
            "Analyse ${root.path} to include it."
    }

    private fun historyOf(versionControl: VersionControl, request: AnalyseRequest, workFolder: File): Lookup = when (versionControl) {
        VersionControl.GIT -> Lookup(History(versionControl, gitHistory(request)))
        VersionControl.SVN -> svnHistory(request.analysedFolder, workFolder)
    }

    // The analyse run prints the ownership hints itself, after the map line, so the scan keeps them back.
    private fun gitHistory(request: AnalyseRequest): ConfiguredAnalyser = ConfiguredAnalyser(
        RepoScanCommand(printsOwnershipHints = false),
        listOf("--repo-path", request.analysedFolder.path) +
            listOfNotNull(AuthorOwnershipScan.FLAG.takeIf { request.authorOwnership }),
        readsProjectFolder = false
    )

    private fun svnHistory(projectFolder: File, workFolder: File): Lookup {
        val logFile = File(workFolder, SVN_LOG_FILE_NAME)
        val failure = svnLogWriter.write(projectFolder, logFile)
        if (failure != null) return Lookup(skipped = VersionControl.SVN.skipped(failure))
        val analyser = ConfiguredAnalyser(SVNLogParser(), listOf(logFile.path), readsProjectFolder = false)
        return Lookup(History(VersionControl.SVN, analyser))
    }

    companion object {
        private const val SVN_LOG_FILE_NAME = "svn.log"
        private const val AT_COMMIT_REASON = "left out with --commit, which reads a git commit"
    }
}
