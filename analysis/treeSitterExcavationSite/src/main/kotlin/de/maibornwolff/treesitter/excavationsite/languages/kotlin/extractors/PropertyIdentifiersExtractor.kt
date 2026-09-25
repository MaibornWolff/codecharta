package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val VARIABLE_DECLARATION = "variable_declaration"
private const val MULTI_VARIABLE_DECLARATION = "multi_variable_declaration"
private const val UNDERSCORE = "_"

/**
 * Extracts single identifier from first variable declaration.
 *
 * Returns empty if multi_variable_declaration found (handled by walker's child traversal).
 * Used for property_declaration and for_statement nodes.
 *
 * Filters out underscore identifiers.
 */
internal fun extractPropertyIdentifiers(node: TSNode, sourceCode: String): List<String> {
    for (child in node.children()) {
        if (child.type == VARIABLE_DECLARATION) {
            val identifier = TreeTraversal.findFirstChildTextByType(child, sourceCode, SIMPLE_IDENTIFIER)
            return listOfNotNull(identifier?.takeIf { it != UNDERSCORE })
        }
        if (child.type == MULTI_VARIABLE_DECLARATION) {
            return emptyList()
        }
    }
    return emptyList()
}
