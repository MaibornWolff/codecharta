package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.parsers.gitlog.RepoScanCommand
import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser
import java.io.File

data class History(val versionControl: VersionControl, val analyser: ConfiguredAnalyser)

data class HistorySearch(val histories: List<History>, val skipped: List<SkippedSource>)

class HistoryFinder(private val svnLogWriter: SvnLogWriter, private val homeFolder: File = File(System.getProperty("user.home"))) {
    fun find(projectFolder: File, leftOut: Set<String>, workFolder: File): HistorySearch {
        val lookups = VersionControl.entries.map { versionControl ->
            if (versionControl.label in leftOut) {
                Lookup(skipped = versionControl.skipped(SkippedSource.LEFT_OUT_REASON))
            } else {
                lookUp(versionControl, projectFolder, workFolder)
            }
        }
        return HistorySearch(lookups.mapNotNull { it.history }, lookups.mapNotNull { it.skipped })
    }

    private class Lookup(val history: History? = null, val skipped: SkippedSource? = null)

    private fun lookUp(versionControl: VersionControl, projectFolder: File, workFolder: File): Lookup {
        if (versionControl.isRootOf(projectFolder)) return historyOf(versionControl, projectFolder, workFolder)
        return Lookup(skipped = versionControl.skipped(whyNotRootOf(versionControl, projectFolder)))
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

    private fun historyOf(versionControl: VersionControl, projectFolder: File, workFolder: File): Lookup = when (versionControl) {
        VersionControl.GIT -> Lookup(History(versionControl, gitHistory(projectFolder)))
        VersionControl.SVN -> svnHistory(projectFolder, workFolder)
    }

    private fun gitHistory(projectFolder: File): ConfiguredAnalyser =
        ConfiguredAnalyser(RepoScanCommand(), listOf("--repo-path", projectFolder.path), readsProjectFolder = false)

    private fun svnHistory(projectFolder: File, workFolder: File): Lookup {
        val logFile = File(workFolder, SVN_LOG_FILE_NAME)
        val failure = svnLogWriter.write(projectFolder, logFile)
        if (failure != null) return Lookup(skipped = VersionControl.SVN.skipped(failure))
        val analyser = ConfiguredAnalyser(SVNLogParser(), listOf(logFile.path), readsProjectFolder = false)
        return Lookup(History(VersionControl.SVN, analyser))
    }

    companion object {
        private const val SVN_LOG_FILE_NAME = "svn.log"
    }
}
