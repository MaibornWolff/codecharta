package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustVisibility
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** What the outer attributes and the visibility of an item say about it for the name lookup. */
internal data class ItemAttributes(
    val isTest: Boolean = false,
    val pathAttribute: String? = null,
    val isMacroExport: Boolean = false,
    val isMacroUse: Boolean = false
) {
    companion object {
        private const val VISIBILITY_MODIFIER = "visibility_modifier"
        private const val PUBLIC = "pub"
        private const val PRIVATE = "pub(self)"
        private const val CFG_TEST = "cfg(test)"
        private const val MACRO_EXPORT = "macro_export"
        private const val MACRO_USE = "macro_use"
        private val PATH_ATTRIBUTE = Regex("""^path\s*=\s*"(.*)"$""")

        /** The attributes of `#[…]` lines, their inner text `cfg(test)` or `path = "x.rs"` each. */
        fun of(attributeTexts: List<String>): ItemAttributes {
            val compact = attributeTexts.map { text -> text.filterNot { it.isWhitespace() } }
            return ItemAttributes(
                isTest = CFG_TEST in compact,
                pathAttribute = attributeTexts.firstNotNullOfOrNull { PATH_ATTRIBUTE.find(it.trim())?.groupValues?.get(1) },
                isMacroExport = compact.any { it.startsWith(MACRO_EXPORT) },
                isMacroUse = compact.any { it.startsWith(MACRO_USE) }
            )
        }

        fun visibilityOf(item: SyntaxNode): RustVisibility {
            val modifier = item.children().firstOrNull { it.type == VISIBILITY_MODIFIER }?.text?.filterNot { it.isWhitespace() }
            return when {
                modifier == null || modifier == PRIVATE -> RustVisibility.PRIVATE
                modifier == PUBLIC -> RustVisibility.PUBLIC
                else -> RustVisibility.RESTRICTED
            }
        }
    }
}
