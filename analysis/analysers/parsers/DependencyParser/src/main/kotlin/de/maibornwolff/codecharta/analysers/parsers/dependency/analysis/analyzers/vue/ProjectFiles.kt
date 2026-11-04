package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.ProjectListing
import java.io.File

/** The files of a project a lookup across it reads: those the run analyses, else every file below the root. */
internal object ProjectFiles {
    private const val HIDDEN_PREFIX = "."
    private const val NODE_MODULES = "node_modules"

    fun pathsOf(analysisRoot: File, analysedFiles: Set<String>): Set<String> = analysedFiles.ifEmpty { filesBelow(analysisRoot) }

    private fun filesBelow(analysisRoot: File): Set<String> = ProjectListing.of(analysisRoot).filePathsOutside(::isSkippedFolder)

    private fun isSkippedFolder(name: String): Boolean = name.startsWith(HIDDEN_PREFIX) || name == NODE_MODULES
}
