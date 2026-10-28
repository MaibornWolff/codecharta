package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustPath
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The path a type names at its base, `Vec` for `Vec<Creature>` and `a::B` for `&a::B`. */
internal object TypePaths {
    private const val TYPE_FIELD = "type"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val SCOPED_TYPE_IDENTIFIER = "scoped_type_identifier"
    private const val GENERIC_TYPE = "generic_type"
    private const val REFERENCE_TYPE = "reference_type"
    private const val POINTER_TYPE = "pointer_type"
    private const val SELF_TYPE = "Self"

    /** Null for `Self` and for a type without a path, such as a tuple or a function type. */
    fun basePathOf(type: SyntaxNode?): RustPath? {
        val node = type?.orNull() ?: return null
        return when (node.type) {
            TYPE_IDENTIFIER -> RustPath(listOf(node.text), RustNamespace.TYPE, node.startByte).takeUnless { node.text == SELF_TYPE }
            SCOPED_TYPE_IDENTIFIER -> RustPath(UseTree.segmentsOf(node), RustNamespace.TYPE, node.startByte)
            GENERIC_TYPE, REFERENCE_TYPE, POINTER_TYPE -> basePathOf(node.getChildByFieldName(TYPE_FIELD))
            else -> null
        }
    }
}
