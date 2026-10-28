package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The names a typedef declares: decision 7 of `cpp.md` gives a struct, union or enum without a tag the first plain name
 * of its typedef. A typedef a macro keeps the parser from reading (`typedef Foo *FooPtr DEPRECATED;`) declares nothing,
 * as its names cannot be told from the macro.
 */
internal object TypedefNames {
    private const val TYPE_DEFINITION = "type_definition"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val TYPE_FIELD = "type"
    private const val ERROR = "ERROR"

    fun nameOfUntagged(specifier: SyntaxNode): String? {
        val typedef = specifier.parent.takeIf { it.type == TYPE_DEFINITION && isReadable(it) } ?: return null
        return typedef.namedChildren().firstOrNull { it.type == TYPE_IDENTIFIER && it.startByte > specifier.startByte }?.text
    }

    fun isReadable(typedef: SyntaxNode): Boolean {
        val type = typedef.getChildByFieldName(TYPE_FIELD)
        return typedef
            .namedChildren()
            .filter { type.isNull || it.startByte != type.startByte }
            .none { it.type == ERROR || TreeTraversal.findAllDescendantsOfType(it, ERROR).isNotEmpty() }
    }
}
