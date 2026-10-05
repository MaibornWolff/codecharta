package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

/**
 * The dependency graph of a project in both projections of one analysis.
 *
 * The physical projection is [edges] — one per ordered pair of files that depend on each other — plus
 * the [levels] every file and folder sits on. Paths are lists of path segments relative to the analysis
 * root, so they join straight onto the file tree the parser emits.
 *
 * The logical projection is the graph as the code declares it: [declarations] are the individual
 * classes, interfaces and functions, [declarationEdges] the dependencies between them, and [namespaces]
 * the packages containing them. It carries the two signals the physical projection cannot: dependencies
 * between declarations of the same file, and the kind of use each dependency is.
 */
data class DependencyGraph(
    val edges: List<FileDependencyEdge> = emptyList(),
    val levels: List<LevelizedPath> = emptyList(),
    val declarations: List<Declaration> = emptyList(),
    val declarationEdges: List<DeclarationEdge> = emptyList(),
    val namespaces: Map<String, LevelizedNamespace> = emptyMap()
)

data class FileDependencyEdge(
    val fromPath: List<String>,
    val toPath: List<String>,
    val weight: Int,
    val isCyclic: Boolean,
    val isPointingUpwards: Boolean
)

data class LevelizedPath(val path: List<String>, val isFile: Boolean, val level: Int)

data class DeclarationAddress(val filePath: List<String>, val key: String)

data class Declaration(
    val address: DeclarationAddress,
    val name: String,
    val kind: String,
    val language: String,
    val namespace: String? = null,
    val level: Int? = null
)

data class DeclarationEdge(
    val from: DeclarationAddress,
    val to: DeclarationAddress,
    val weight: Int,
    val usage: List<String>,
    val isCyclic: Boolean,
    val isPointingUpwards: Boolean
)

data class LevelizedNamespace(val level: Int, val parent: String? = null)
