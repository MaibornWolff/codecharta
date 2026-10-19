package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserrunner.ConfiguredAnalyser
import de.maibornwolff.codecharta.analysers.parsers.gitlog.RepoScanCommand
import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser
import java.io.File

data class History(val versionControl: VersionControl, val analyser: ConfiguredAnalyser)

data class HistorySearch(val histories: List<History>, val hints: List<String>)

class HistoryFinder(private val svnLogWriter: SvnLogWriter) {
    fun find(projectFolder: File, wanted: List<VersionControl>, workFolder: File): HistorySearch {
        val lookups = wanted.mapNotNull { lookUp(it, projectFolder, workFolder) }
        return HistorySearch(lookups.mapNotNull { it.history }, lookups.mapNotNull { it.hint })
    }

    private class Lookup(val history: History? = null, val hint: String? = null)

    private fun lookUp(versionControl: VersionControl, projectFolder: File, workFolder: File): Lookup? {
        if (versionControl.isRootOf(projectFolder)) return historyOf(versionControl, projectFolder, workFolder)
        val root = versionControl.enclosingRootOf(projectFolder) ?: return null
        val reason =
            "${projectFolder.path} is inside the ${versionControl.label} ${versionControl.checkout} ${root.path}, not at its root. " +
                "Analyse ${root.path} to include it."
        return Lookup(hint = versionControl.missingHistory(reason))
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
        if (failure != null) return Lookup(hint = VersionControl.SVN.missingHistory(failure))
        val analyser = ConfiguredAnalyser(SVNLogParser(), listOf(logFile.path), readsProjectFolder = false)
        return Lookup(History(VersionControl.SVN, analyser))
    }

    companion object {
        private const val SVN_LOG_FILE_NAME = "svn.log"
    }
}
