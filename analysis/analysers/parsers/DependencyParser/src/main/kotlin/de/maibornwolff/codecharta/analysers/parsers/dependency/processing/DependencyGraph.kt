package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

/**
 * The dependency graph of a project in both projections of one analysis.
 *
 * The physical projection is [edges] — one per ordered pair of files that depend on each other — plus
 * the [levels] every file and folder sits on. Paths are lists of path segments relative to the analysis
 * root, so they join straight onto the file tree the parser emits.
 *
 * The logical projection is the graph as the code declares it: [declarations] are the individual
 * classes, interfaces and functions, [declarationEdges] the dependencies between them, and
 * [namespaceLevels] the levels of the packages containing them. It carries the two signals the physical
 * projection cannot: dependencies between declarations of the same file, and the kind of use each
 * dependency is.
 */
data class DependencyGraph(
    val edges: List<FileDependencyEdge> = emptyList(),
    val levels: List<LevelizedPath> = emptyList(),
    val declarations: List<Declaration> = emptyList(),
    val declarationEdges: List<DeclarationEdge> = emptyList(),
    val namespaceLevels: Map<String, Int> = emptyMap()
)

data class FileDependencyEdge(
    val fromPath: List<String>,
    val toPath: List<String>,
    val weight: Int,
    val isCyclic: Boolean,
    val isPointingUpwards: Boolean
)

data class LevelizedPath(val path: List<String>, val isFile: Boolean, val level: Int)

/**
 * One declaration, addressed by [id], its dotted logical path. [filePath] is the file it was declared
 * in, the join back onto the physical projection; [level] is absent when levelization was skipped.
 */
data class Declaration(
    val id: String,
    val name: String,
    val kind: String,
    val filePath: List<String>,
    val level: Int? = null
)

/** A dependency between two declarations, with every way [fromId] uses [toId]. */
data class DeclarationEdge(
    val fromId: String,
    val toId: String,
    val weight: Int,
    val usage: List<String>,
    val isCyclic: Boolean,
    val isPointingUpwards: Boolean
)
