package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType

/** A call `define('NAME', value)`, which declares a constant rather than running code. */
internal object DefineCalls {
    private const val FUNCTION_CALL_EXPRESSION = "function_call_expression"
    private const val FUNCTION_FIELD = "function"
    private const val NAME = "name"
    private const val DEFINE = "define"

    fun isDefine(node: SyntaxNode): Boolean =
        node.type == FUNCTION_CALL_EXPRESSION && node.fieldOfType(FUNCTION_FIELD, NAME)?.text == DEFINE
}
