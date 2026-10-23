package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The qualified names one file writes, `Shapes.Circle` or `Color.Red`, by "A qualified name" of
 * `docs/name-resolution/typescript.md`: such a name means the declaration of its longest prefix that is one, a member
 * of a namespace below it or else the class or enum it starts with. A name that starts with a declaration of the own
 * file is written below the file's path.
 */
internal class QualifiedNames(private val filePath: Path) {
    private val writtenNames = HashSet<String>()

    /** Remembers the qualified names among what the extractor reports, before any of them is rewritten. */
    fun remember(usedTypes: Set<UsedType>) = usedTypes.forEach { remember(it) }

    /** The nodes with each qualified name meaning its longest prefix that names a declaration. */
    fun resolvedIn(nodes: List<Node>): List<Node> {
        if (writtenNames.isEmpty()) return nodes
        val ownNames = nodes.filter { it.pathWithName.withoutName() == filePath.parts }.mapTo(HashSet()) { it.name() }
        return nodes.map { node -> node.copy(usedTypes = node.usedTypes.mapTo(LinkedHashSet()) { withPrefixes(it, ownNames) }) }
    }

    private fun remember(usedType: UsedType) {
        if (usedType.name.contains(SEPARATOR)) writtenNames.add(usedType.name)
        usedType.genericTypes.forEach { remember(it) }
    }

    private fun withPrefixes(type: Type, ownNames: Set<String>): Type {
        val genericTypes = type.genericTypes.map { withPrefixes(it, ownNames) }
        if (type.name !in writtenNames) return type.copy(genericTypes = genericTypes)
        val segments = type.name.split(SEPARATOR)
        val prefixes = (segments.size downTo 1).map { segments.take(it) }
        val names = if (segments.first() in ownNames) {
            prefixes.map { (filePath + Path(it)).withDots() }
        } else {
            prefixes.map { it.joinToString(SEPARATOR) }
        }
        return type.copy(name = names.first(), genericTypes = genericTypes, fallbacks = names.drop(1).map { Type.simple(it) })
    }

    companion object {
        private const val SEPARATOR = "."
    }
}
