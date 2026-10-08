package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IDENTIFIER = "identifier"
private const val PARAMS = "params"
private const val ARRAY_TYPE = "array_type"

/**
 * Extracts params parameters in order: `void Method(params int[] numbers)`
 *
 * Finds identifiers that follow the pattern: params -> array_type -> identifier
 */
internal fun extractParamsParametersInOrder(node: SyntaxNode): List<String> {
    data class State(val foundParams: Boolean, val foundArrayType: Boolean)

    return buildList {
        node.children().fold(State(false, false)) { state, child ->
            when (child.type) {
                PARAMS -> State(foundParams = true, foundArrayType = false)
                ARRAY_TYPE ->
                    if (state.foundParams) State(true, true) else state
                IDENTIFIER ->
                    if (state.foundParams && state.foundArrayType) {
                        add(child.text)
                        State(false, false)
                    } else {
                        state
                    }
                else -> state
            }
        }
    }
}
