package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** Decision 7 of `cpp.md`: a struct, union or enum without a tag takes the first plain name the typedef around it declares. */
internal object TypedefNames {
    private const val TYPE_DEFINITION = "type_definition"
    private const val TYPE_IDENTIFIER = "type_identifier"

    fun nameOfUntagged(specifier: SyntaxNode): String? {
        val typedef = specifier.parent.takeIf { it.type == TYPE_DEFINITION } ?: return null
        return typedef.namedChildren().firstOrNull { it.type == TYPE_IDENTIFIER && it.startByte > specifier.startByte }?.text
    }
}
