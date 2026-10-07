package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val VALUE_BINDING_PATTERN = "value_binding_pattern"

/**
 * Extracts all bound variables from guard/if statements.
 *
 * Swift guard/if let bindings have structure: `value_binding_pattern simple_identifier`
 * This extracts all identifiers that follow a value_binding_pattern.
 */
internal fun extractAllBoundVariables(node: SyntaxNode): List<String> {
    val children = node.children().toList()
    return children
        .zipWithNext()
        .filter { (current, next) ->
            current.type == VALUE_BINDING_PATTERN &&
                next.type == SIMPLE_IDENTIFIER
        }.map { (_, next) -> next.text }
}
