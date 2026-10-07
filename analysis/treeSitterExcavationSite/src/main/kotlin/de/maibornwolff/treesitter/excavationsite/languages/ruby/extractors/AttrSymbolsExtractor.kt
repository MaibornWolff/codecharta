package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val ARGUMENT_LIST = "argument_list"
private const val SIMPLE_SYMBOL = "simple_symbol"

private val ATTR_METHODS = setOf("attr_reader", "attr_writer", "attr_accessor")

/**
 * Extracts symbols from attr_reader/attr_writer/attr_accessor calls as identifiers.
 */
internal fun extractAttrSymbols(callNode: SyntaxNode): List<String> {
    val methodName = TreeTraversal.findFirstChildTextByType(
        callNode,
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
                .map { it.text.removePrefix(":") }
        }.toList()
}
