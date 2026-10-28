package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

/**
 * The used types of a Python declaration: every name [UseSites] calls a use, with the attribute names behind it, as
 * what the binding Python sees there means, one use for each of its alternatives; the names a wildcard import may bind
 * come first and the binding after them as fallbacks. A name the code around binds as a value, or nothing binds (a builtin), uses no declaration.
 */
internal class PythonUses(private val module: ModuleBindings, private val scopes: LocalScopes) {
    fun of(definition: SyntaxNode, nestedDeclarations: List<SyntaxNode>): Set<UsedType> = TreeTraversal
        .findAllDescendantsOfType(definition, IDENTIFIER)
        .filter { name -> nestedDeclarations.none { it.contains(name) } && UseSites.isUse(name) }
        .flatMapTo(LinkedHashSet()) { name -> usesOf(name) }

    // One use per meaning the name may have, each with the uses it falls back to
    private fun usesOf(name: SyntaxNode): List<UsedType> {
        val meanings = scopes.bindingsOf(name)?.map { listOf(it) } ?: module.of(name.text, positionOf(name))
        return meanings.mapNotNull { bindings ->
            val uses = bindings.mapNotNull { it.useOf(name.text, attributesBehind(name)) }
            uses.firstOrNull()?.copy(fallbacks = uses.drop(1))
        }
    }

    // The attribute names of the chain the name starts: `b`, `c` of `a.b.c`
    private fun attributesBehind(name: SyntaxNode): List<String> = generateSequence(name) { node ->
        node.parent.takeIf { it.type == ATTRIBUTE && it.getChildByFieldName(OBJECT_FIELD).startsAt(node) }
    }.drop(1).map { it.getChildByFieldName(ATTRIBUTE_FIELD).text }.toList()

    // A name in a function body or an annotation sees the module after it ran, any other one the module before its statement
    private fun positionOf(name: SyntaxNode): Int? {
        if (scopes.isInFunctionBody(name) || name.ancestors().any { it.type == ANNOTATION }) return null
        return name
            .ancestors()
            .toList()
            .dropLast(1)
            .lastOrNull()
            ?.startByte ?: name.startByte
    }

    private fun SyntaxNode.startsAt(other: SyntaxNode): Boolean = startByte == other.startByte && endByte == other.endByte

    private fun SyntaxNode.contains(other: SyntaxNode): Boolean = other.startByte >= startByte && other.endByte <= endByte

    companion object {
        private const val IDENTIFIER = "identifier"
        private const val ATTRIBUTE = "attribute"
        private const val ANNOTATION = "type"
        private const val OBJECT_FIELD = "object"
        private const val ATTRIBUTE_FIELD = "attribute"
    }
}
