package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The components Vue's `defineAsyncComponent` loads, by decision 13 of `docs/name-resolution/typescript.md`:
 * `defineAsyncComponent(() => import('./Form.vue'))`, or with `{ loader: () => import(…) }`, stands for the default
 * export of `Form.vue`, as the runtime renders it, so the declaration it is written in uses that default export,
 * reported as [DEFAULT_EXPORT] with the specifier as its prefix.
 */
internal object AsyncComponents {
    private const val DEFINE_ASYNC_COMPONENT = "defineAsyncComponent"
    private const val LOADER_OPTION = "loader"
    private const val ARROW_FUNCTION = "arrow_function"
    private const val IMPORT_KEYWORD = "import"

    fun usesIn(declaration: SyntaxNode): List<UsedType> = TreeTraversal
        .findAllDescendantsOfType(declaration, CALL_EXPRESSION)
        .filter { call -> call.getChildByFieldName("function").orNull()?.text == DEFINE_ASYNC_COMPONENT }
        .mapNotNull { call -> loadedSpecifierOf(call) }
        .map { specifier -> UsedType(DEFAULT_EXPORT, namespacePrefix = specifier.split(SPECIFIER_SEPARATOR)) }

    private fun loadedSpecifierOf(call: SyntaxNode): String? {
        val argument = call.getChildByFieldName("arguments").orNull()?.namedChildren()?.firstOrNull() ?: return null
        val loader = if (argument.type == OBJECT) loaderOptionOf(argument) else argument
        val importCall = loader
            ?.takeIf { it.type == ARROW_FUNCTION }
            ?.getChildByFieldName("body")
            ?.orNull()
            ?.takeIf { body -> body.type == CALL_EXPRESSION && body.children().any { it.type == IMPORT_KEYWORD } }
            ?: return null
        val specifier = importCall.getChildByFieldName("arguments").orNull()?.namedChildren()?.firstOrNull { it.type == STRING }
        return specifier?.let { TreeTraversal.findFirstChildTextByType(it, STRING_FRAGMENT) }
    }

    private fun loaderOptionOf(options: SyntaxNode): SyntaxNode? = options
        .children()
        .firstOrNull { it.type == PAIR && it.getChildByFieldName("key").orNull()?.text == LOADER_OPTION }
        ?.getChildByFieldName("value")
        ?.orNull()
}
