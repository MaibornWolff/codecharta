package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PROPERTY_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val ENUM_BODY = "enum_body"
private const val ENUM_ASSIGNMENT = "enum_assignment"

/**
 * Extracts enum name and all member names from enum declaration.
 */
internal fun extractIdentifiersFromEnumDeclaration(node: SyntaxNode): List<String> {
    val enumName = TreeTraversal.findFirstChildTextByType(
        node,
        IDENTIFIER,
        TYPE_IDENTIFIER
    )
    val enumMembers = node
        .children()
        .filter { it.type == ENUM_BODY }
        .flatMap { it.children() }
        .mapNotNull { child ->
            when (child.type) {
                PROPERTY_IDENTIFIER -> {
                    child.text
                }
                ENUM_ASSIGNMENT -> {
                    TreeTraversal.findFirstChildTextByType(
                        child,
                        PROPERTY_IDENTIFIER,
                        IDENTIFIER
                    )
                }
                else -> null
            }
        }.toList()
    return listOfNotNull(enumName) + enumMembers
}
