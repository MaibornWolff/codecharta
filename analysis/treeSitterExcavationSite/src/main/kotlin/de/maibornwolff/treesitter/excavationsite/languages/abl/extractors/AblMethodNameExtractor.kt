package de.maibornwolff.treesitter.excavationsite.languages.abl.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts the method name from an ABL method_definition node.
 *
 * ABL method structure: METHOD [access] [return_type] [method_name](params)
 * The method name is the second identifier child (first is return type).
 */
fun extractAblMethodName(node: TSNode, code: String): String? {
    val identifiers = node
        .children()
        .filter { it.type == "identifier" }
        .toList()

    // Method name is the second identifier (after return type)
    // For VOID methods, there's only one identifier (the method name)
    return when {
        identifiers.size >= 2 -> extractText(identifiers[1], code)
        identifiers.size == 1 -> extractText(identifiers[0], code)
        else -> null
    }
}

private fun extractText(node: TSNode, code: String): String {
    val bytes = code.toByteArray(Charsets.UTF_8)
    return String(bytes, node.startByte, node.endByte - node.startByte, Charsets.UTF_8).trim()
}
