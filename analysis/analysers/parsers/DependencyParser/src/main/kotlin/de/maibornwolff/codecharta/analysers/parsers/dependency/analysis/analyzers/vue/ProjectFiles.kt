package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import java.io.File

/** The files of a project a lookup across it reads: those the run analyses, else every file below the root. */
internal object ProjectFiles {
    private const val HIDDEN_PREFIX = "."
    private const val NODE_MODULES = "node_modules"

    fun pathsOf(analysisRoot: File, analysedFiles: Set<String>): Set<String> = analysedFiles.ifEmpty { filesBelow(analysisRoot) }

    private fun filesBelow(analysisRoot: File): Set<String> = analysisRoot
        .walkTopDown()
        .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name == NODE_MODULES) }
        .filter { it.isFile }
        .mapTo(HashSet()) { it.relativeTo(analysisRoot).path }
}
