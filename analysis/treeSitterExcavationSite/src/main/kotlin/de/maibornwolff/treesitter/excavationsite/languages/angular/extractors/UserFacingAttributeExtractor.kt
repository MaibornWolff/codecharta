package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val ATTRIBUTE = "attribute"
private const val ATTRIBUTE_NAME = "attribute_name"
private const val QUOTED_ATTRIBUTE_VALUE = "quoted_attribute_value"

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
 * Whether an attribute name marks text a user reads: one of the standard text attributes of HTML and ARIA, or a name
 * that ends like one (`hoverHint`, `empty-message`, `pageTitle`). A name with an Angular prefix is no text: `i18n-title`
 * marks the `title` for translation, `bind-title` and `let-label` bind an expression, `bindLabel` names a property.
 */
internal object UserFacingTextAttribute {
    private const val KEBAB_SEPARATOR = "-"
    private val STANDARD_NAMES =
        setOf("title", "alt", "placeholder", "aria-label", "aria-description", "aria-placeholder", "label")
    private val TEXT_SUFFIXES = listOf("hint", "label", "title", "text", "tooltip", "placeholder", "description", "message")
    private val ANGULAR_PREFIXES = listOf("i18n", "bind", "on-", "let-", "ref-")

    fun matches(attributeName: String): Boolean {
        val name = attributeName.lowercase()
        if (ANGULAR_PREFIXES.any { name.startsWith(it) }) return false
        return name in STANDARD_NAMES || TEXT_SUFFIXES.any { name.replace(KEBAB_SEPARATOR, "").endsWith(it) }
    }
}
