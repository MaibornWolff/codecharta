package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The keys that tell the SQL objects a file creates apart, so that an object created and then altered counts once. */
internal object SqlObjectKeys {
    private const val NAME_FIELD = "name"
    private const val QUALIFIER_SEPARATOR = "/"
    private const val QUOTES = "\"`[]"

    // The name of the object, qualified by the names of the definitions around it, such as its package
    fun qualifiedName(node: SyntaxNode): String? {
        val name = nameOf(node) ?: return null
        val qualifiers = generateSequence(node.parent.orNull()) { it.parent.orNull() }.mapNotNull { nameOf(it) }.toList()
        return (qualifiers.reversed() + name).joinToString(QUALIFIER_SEPARATOR)
    }

    private fun nameOf(node: SyntaxNode): String? = node
        .getChildByFieldName(NAME_FIELD)
        .orNull()
        ?.text
        ?.lowercase()
        ?.filterNot { it in QUOTES }
}
