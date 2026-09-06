package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val PARAMETER_LIST = "parameter_list"
private const val TYPE_PARAMETER_LIST = "type_parameter_list"

/**
 * Extracts method name from method_declaration or local_function_statement.
 *
 * Finds the last identifier before parameter_list or type_parameter_list.
 */
internal fun findMethodName(node: TSNode, sourceCode: String): String? {
    var lastIdentifier: String? = null
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER ->
                lastIdentifier = TreeTraversal.getNodeText(child, sourceCode)
            PARAMETER_LIST,
            TYPE_PARAMETER_LIST -> return lastIdentifier
        }
    }
    return lastIdentifier
}
