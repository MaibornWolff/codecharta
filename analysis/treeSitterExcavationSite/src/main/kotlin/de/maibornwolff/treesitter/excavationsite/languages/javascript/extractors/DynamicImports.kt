package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The dynamic imports of a module, by decision 4 of `docs/name-resolution/typescript.md`: `import('./m')` loads the
 * module `m` later, bound to a name of its own, as a namespace import binds one, so that what is read from its result
 * is a name through that binding.
 */
internal object DynamicImports {
    private const val BINDING_PREFIX = "dynamic_import_"
    private const val PARENTHESIZED_EXPRESSION = "parenthesized_expression"
    private const val AWAIT_EXPRESSION = "await_expression"
    private const val IMPORT_KEYWORD = "import"

    /** The name the module of the dynamic import [importCall] is bound to: unique in its file by the call's position. */
    fun bindingNameOf(importCall: SyntaxNode): String = BINDING_PREFIX + importCall.startByte

    /** The module an expression reads as `(await import('./m'))`, null for any other expression. */
    fun moduleReadBy(expression: SyntaxNode): String? {
        val awaited = expression.takeIf { it.type == PARENTHESIZED_EXPRESSION }?.namedChildren()?.singleOrNull()
        val importCall = awaited
            ?.takeIf { it.type == AWAIT_EXPRESSION }
            ?.namedChildren()
            ?.singleOrNull()
            ?.takeIf { call -> call.type == CALL_EXPRESSION && call.children().any { it.type == IMPORT_KEYWORD } }
        return importCall?.let { bindingNameOf(it) }
    }
}
