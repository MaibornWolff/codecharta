package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"
private const val QUALIFIED_TYPE = "qualified_type"

/**
 * Extracts first identifier from var or const declaration.
 * Handles both single spec and spec_list patterns.
 */
internal fun extractFromVarOrConstDeclaration(node: SyntaxNode, specType: String): String? = node
    .children()
    .firstOrNull { it.type == specType }
    ?.let { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER) }

/**
 * Extracts all identifiers from var or const declaration.
 * Handles both single spec and spec_list (block) patterns.
 */
internal fun extractAllFromVarOrConstDeclaration(node: SyntaxNode, specType: String): List<String> {
    val specListType = "${specType}_list"
    return node
        .children()
        .flatMap { child ->
            when (child.type) {
                specType ->
                    TreeTraversal
                        .findAllChildrenTextByType(
                            child,
                            IDENTIFIER
                        ).asSequence()
                specListType ->
                    child
                        .children()
                        .filter { it.type == specType }
                        .flatMap {
                            TreeTraversal
                                .findAllChildrenTextByType(
                                    it,
                                    IDENTIFIER
                                ).asSequence()
                        }
                else -> emptySequence()
            }
        }.toList()
}

/**
 * Extracts identifier from embedded field.
 * Embedded fields use type_identifier directly or qualified_type.
 */
internal fun extractEmbeddedFieldIdentifier(node: SyntaxNode): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return when (firstChild.type) {
        TYPE_IDENTIFIER -> firstChild.text
        QUALIFIED_TYPE -> TreeTraversal.findFirstChildTextByType(
            firstChild,
            TYPE_IDENTIFIER
        )
        else -> null
    }
}
