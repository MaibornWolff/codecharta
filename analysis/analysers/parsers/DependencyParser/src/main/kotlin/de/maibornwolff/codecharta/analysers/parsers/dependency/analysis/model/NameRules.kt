package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/**
 * How a language finds the project declaration a written name means, in the order its page under
 * `docs/name-resolution/` writes down; [DefaultNameRules] serves the languages without one. The language's own rules
 * live next to its analyzer, and `DependencyResolverService` picks them per language.
 */
interface NameRules {
    /** The resolution of the names one declaration writes. */
    fun namesOf(node: Node, project: ProjectNames): DeclarationNames

    /** A step over the resolved nodes of the language, for what only the declarations a name resolved to can tell. */
    fun afterResolution(nodes: List<Node>): List<Node> = nodes
}

fun interface DeclarationNames {
    /** The declaration a written name means: a project declaration, a library type or [Path.unknown]. */
    fun resolve(writtenName: String): Path
}

/** What the name rules of every language look a name up in. */
class ProjectNames(
    val projectDictionary: Map<String, List<Path>>,
    val languageDictionary: Map<String, Path>,
    val internalNodePaths: Set<String>,
    val fileScopedPaths: FileScopedPaths
) {
    /** The package or namespace a declaration lies in: its path without the declarations around it. */
    fun packageOf(path: Path): List<String> {
        var parts = path.withoutName()
        while (parts.isNotEmpty() && Path(parts).withDots() in internalNodePaths) parts = parts.dropLast(1)
        return parts
    }
}
