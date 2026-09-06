package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"
private const val QUALIFIED_TYPE = "qualified_type"

/**
 * Extracts first identifier from var or const declaration.
 * Handles both single spec and spec_list patterns.
 */
internal fun extractFromVarOrConstDeclaration(node: TSNode, sourceCode: String, specType: String): String? = node
    .children()
    .firstOrNull { it.type == specType }
    ?.let { TreeTraversal.findFirstChildTextByType(it, sourceCode, IDENTIFIER) }

/**
 * Extracts all identifiers from var or const declaration.
 * Handles both single spec and spec_list (block) patterns.
 */
internal fun extractAllFromVarOrConstDeclaration(node: TSNode, sourceCode: String, specType: String): List<String> {
    val specListType = "${specType}_list"
    return node
        .children()
        .flatMap { child ->
            when (child.type) {
                specType ->
                    TreeTraversal
                        .findAllChildrenTextByType(
                            child,
                            sourceCode,
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
                                    sourceCode,
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
internal fun extractEmbeddedFieldIdentifier(node: TSNode, sourceCode: String): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return when (firstChild.type) {
        TYPE_IDENTIFIER -> TreeTraversal.getNodeText(firstChild, sourceCode)
        QUALIFIED_TYPE -> TreeTraversal.findFirstChildTextByType(
            firstChild,
            sourceCode,
            TYPE_IDENTIFIER
        )
        else -> null
    }
}
