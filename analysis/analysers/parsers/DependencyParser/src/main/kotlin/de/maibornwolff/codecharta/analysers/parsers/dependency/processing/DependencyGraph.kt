package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

/**
 * The dependency graph of a project at file level: one edge per ordered pair of files that depend on
 * each other, plus the level every file and folder sits on.
 *
 * Paths are lists of path segments relative to the analysis root, so they join straight onto the file
 * tree the parser emits.
 */
data class DependencyGraph(val edges: List<FileDependencyEdge> = emptyList(), val levels: List<LevelizedPath> = emptyList())

data class FileDependencyEdge(
    val fromPath: List<String>,
    val toPath: List<String>,
    val weight: Int,
    val isCyclic: Boolean,
    val isPointingUpwards: Boolean
)

data class LevelizedPath(val path: List<String>, val isFile: Boolean, val level: Int)
