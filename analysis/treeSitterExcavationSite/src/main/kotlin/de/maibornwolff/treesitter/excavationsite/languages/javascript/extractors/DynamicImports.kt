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

    /**
     * The module an expression reads as `(await import('./m'))`, or as `import('./m')` in an import type
     * (`import('./m').A`, decision 15); null for any other expression.
     */
    fun moduleReadBy(expression: SyntaxNode): String? {
        val importCall = expression.takeIf { isImportCall(it) && isImportType(it) } ?: awaitedImportCallIn(expression)
        return importCall?.let { bindingNameOf(it) }
    }

    // In code the result of `import('./m')` is a promise, whose members are only called (`then`); an import type never is
    private fun isImportType(importCall: SyntaxNode): Boolean = importCall.parent.parent.type != CALL_EXPRESSION

    private fun awaitedImportCallIn(expression: SyntaxNode): SyntaxNode? = expression
        .takeIf { it.type == PARENTHESIZED_EXPRESSION }
        ?.namedChildren()
        ?.singleOrNull()
        ?.takeIf { it.type == AWAIT_EXPRESSION }
        ?.namedChildren()
        ?.singleOrNull()
        ?.takeIf { isImportCall(it) }

    private fun isImportCall(node: SyntaxNode): Boolean = node.type == CALL_EXPRESSION && node.children().any { it.type == IMPORT_KEYWORD }
}
