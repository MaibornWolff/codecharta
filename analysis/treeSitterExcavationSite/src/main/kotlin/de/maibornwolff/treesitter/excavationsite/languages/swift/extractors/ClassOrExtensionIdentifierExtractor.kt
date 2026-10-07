package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val TYPE_IDENTIFIER = "type_identifier"
private const val USER_TYPE = "user_type"
private const val EXTENSION = "extension"

/**
 * Extracts identifier from class declaration or extension.
 *
 * For regular classes, extracts the type_identifier child.
 * For extensions (`extension SomeClass { ... }`), extracts from the user_type child.
 */
internal fun extractClassOrExtensionIdentifier(node: SyntaxNode): String? = if (hasExtensionKeyword(node)) {
    extractExtensionTypeName(node)
} else {
    TreeTraversal.findFirstChildTextByType(node, TYPE_IDENTIFIER)
}

private fun hasExtensionKeyword(node: SyntaxNode): Boolean = node.children().any { it.type == EXTENSION }

private fun extractExtensionTypeName(node: SyntaxNode): String? {
    val userTypeChild = node.children().firstOrNull {
        it.type == USER_TYPE
    } ?: return null
    return TreeTraversal.findFirstChildTextByType(
        userTypeChild,
        TYPE_IDENTIFIER,
        SIMPLE_IDENTIFIER
    )
}
