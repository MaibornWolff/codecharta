package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val ARGUMENT_LIST = "argument_list"
private const val SIMPLE_SYMBOL = "simple_symbol"

private val ATTR_METHODS = setOf("attr_reader", "attr_writer", "attr_accessor")

/**
 * Extracts symbols from attr_reader/attr_writer/attr_accessor calls as identifiers.
 */
internal fun extractAttrSymbols(callNode: TSNode, sourceCode: String): List<String> {
    val methodName = TreeTraversal.findFirstChildTextByType(
        callNode,
        sourceCode,
        IDENTIFIER
    )
    if (methodName !in ATTR_METHODS) return emptyList()

    return callNode
        .children()
        .filter { it.type == ARGUMENT_LIST }
        .flatMap { argList ->
            argList
                .children()
                .filter { it.type == SIMPLE_SYMBOL }
                .map { TreeTraversal.getNodeText(it, sourceCode).removePrefix(":") }
        }.toList()
}
