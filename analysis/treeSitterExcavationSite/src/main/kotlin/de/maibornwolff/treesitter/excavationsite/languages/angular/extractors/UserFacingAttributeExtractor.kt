package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.QUOTED_ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Extracts the value of a plain attribute that holds text a user reads, such as a `title` or a `hoverHint`. The values
 * of all other attributes (`class`, `style`, `id`, `icon`, `type`, `href`, `src`, ...) are markup, not text.
 */
internal fun extractUserFacingAttributeText(attributeValue: SyntaxNode): String? {
    val valueHolder = attributeValue.parent
    val attribute = if (valueHolder.type == QUOTED_ATTRIBUTE_VALUE) valueHolder.parent else valueHolder
    if (attribute.type != ATTRIBUTE) return null
    val attributeName = TreeTraversal.findFirstChildTextByType(attribute, ATTRIBUTE_NAME) ?: return null
    if (!UserFacingTextAttribute.matches(attributeName)) return null
    // A value with an interpolation is several value nodes, padded with the spaces around the interpolation
    return attributeValue.text.trim().ifEmpty { null }
}

/**
 * Whether an attribute name marks text a user reads: `alt`, or a name whose last word, after a hyphen or at a capital
 * letter, is a text word (`title`, `aria-label`, `hoverHint`, `empty-message`), so `context` or `subtitle` are no
 * text. A name with an Angular prefix is no text: `i18n-title` marks the `title` for translation, `bind-title` and
 * `let-label` bind an expression, `bindLabel` names a property.
 */
internal object UserFacingTextAttribute {
    private const val KEBAB_SEPARATOR = '-'

    // The one standard text attribute that is no text word: `title`, `label`, `aria-label` and the others end in one
    private const val ALTERNATIVE_TEXT = "alt"
    private val TEXT_WORDS = listOf("hint", "label", "title", "text", "tooltip", "placeholder", "description", "message")
    private val ANGULAR_PREFIXES = listOf("i18n", "bind", "on-", "let-", "ref-")

    fun matches(attributeName: String): Boolean {
        val name = attributeName.lowercase()
        if (ANGULAR_PREFIXES.any { name.startsWith(it) }) return false
        return name == ALTERNATIVE_TEXT || lastWordOf(attributeName).lowercase() in TEXT_WORDS
    }

    // The word after the last hyphen, from its last capital letter on: `Hint` of `hoverHint`, `message` of `empty-message`
    private fun lastWordOf(name: String): String {
        val afterHyphen = name.substringAfterLast(KEBAB_SEPARATOR)
        val lastCapital = afterHyphen.indexOfLast { it.isUpperCase() }
        return if (lastCapital > 0) afterHyphen.substring(lastCapital) else afterHyphen
    }
}
