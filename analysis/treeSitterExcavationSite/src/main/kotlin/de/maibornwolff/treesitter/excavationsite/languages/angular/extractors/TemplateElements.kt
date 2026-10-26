package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.languages.angular.QUOTED_ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.languages.angular.SELF_CLOSING_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.START_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.TAG_NAME
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularSelector
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The elements of a template, each as the selector Angular's compiler matches directive selectors against: its tag
 * and its attributes without their namespace, the values and the classes of its `class` attribute in lower case. A
 * reference (`#map`, `ref-map`), a template variable (`let-cave`), an i18n marker, an animation trigger (`@fade`) and
 * a binding written with a prefix (`bind-`, `on-`, `bindon-`) are no attributes to the compiler.
 */
internal object TemplateElements {
    private val NOT_ATTRIBUTE_PREFIXES = listOf("#", "@", "ref-", "let-", "bind-", "on-", "bindon-", "i18n-")
    private const val I18N = "i18n"
    private const val CLASS = "class"
    private const val NAMESPACE_SEPARATOR = ":"
    private val CLASS_SEPARATOR = Regex("\\s+")

    fun of(rootNode: SyntaxNode): List<AngularSelector> = TreeTraversal
        .findAllDescendantsOfType(rootNode, START_TAG, SELF_CLOSING_TAG)
        .mapNotNull { selectorOf(it) }
        .distinct()

    private fun selectorOf(tag: SyntaxNode): AngularSelector? {
        val tagName = TreeTraversal.findFirstChildTextByType(tag, TAG_NAME) ?: return null
        val attributes = tag
            .children()
            .filter { it.type == ATTRIBUTE }
            .mapNotNull { attributeOf(it) }
            .toList()
            .toMap()
        val classNames = attributes[CLASS]?.split(CLASS_SEPARATOR)?.filter { it.isNotEmpty() }.orEmpty().toSet()
        return AngularSelector(element = withoutNamespace(tagName).lowercase(), attributes = attributes, classNames = classNames)
    }

    private fun attributeOf(attribute: SyntaxNode): Pair<String, String>? {
        val name = TreeTraversal.findFirstChildTextByType(attribute, ATTRIBUTE_NAME) ?: return null
        if (name == I18N || NOT_ATTRIBUTE_PREFIXES.any { name.startsWith(it) }) return null
        return withoutNamespace(name) to valueOf(attribute).lowercase()
    }

    private fun valueOf(attribute: SyntaxNode): String {
        val quoted = attribute.children().firstOrNull { it.type == QUOTED_ATTRIBUTE_VALUE } ?: attribute
        return TreeTraversal.findFirstChildTextByType(quoted, ATTRIBUTE_VALUE).orEmpty()
    }

    private fun withoutNamespace(name: String): String = name.substringAfterLast(NAMESPACE_SEPARATOR)
}
