package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.languages.angular.BINDING_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.EVENT_BINDING
import de.maibornwolff.treesitter.excavationsite.languages.angular.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.angular.PROPERTY_BINDING
import de.maibornwolff.treesitter.excavationsite.languages.angular.QUOTED_ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.languages.angular.SELF_CLOSING_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.START_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.TAG_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.TWO_WAY_BINDING
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularSelector
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The elements of a template, each as the selector Angular's compiler matches directive selectors against: its tag
 * and its attributes without their namespace, the values and the classes of its `class` attribute in lower case, and
 * the names of its property bindings (`[x]`, `bind-x`), events (`(x)`, `on-x`) and two-way bindings (`[(x)]`,
 * `bindon-x`), which are the input `x` and the event `xChange`. A reference (`#map`, `ref-map`), a template variable
 * (`let-cave`), an i18n marker, an animation and an attribute, class or style binding (`[attr.x]`) are none.
 */
internal object TemplateElements {
    private val NOT_ATTRIBUTE_PREFIXES = listOf("#", "@", "ref-", "let-", "i18n-")
    private const val BIND_PREFIX = "bind-"
    private const val ON_PREFIX = "on-"
    private const val BINDON_PREFIX = "bindon-"
    private const val CHANGE_EVENT_SUFFIX = "Change"
    private const val NO_VALUE = ""
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
            .flatMap { attributesOf(it) }
            .toList()
            .toMap()
        val classNames = attributes[CLASS]?.split(CLASS_SEPARATOR)?.filter { it.isNotEmpty() }.orEmpty().toSet()
        return AngularSelector(element = withoutNamespace(tagName).lowercase(), attributes = attributes, classNames = classNames)
    }

    private fun attributesOf(attribute: SyntaxNode): List<Pair<String, String>> {
        val written = attribute.children().firstOrNull() ?: return emptyList()
        return when (written.type) {
            ATTRIBUTE_NAME -> textAttributesOf(written.text, attribute)
            PROPERTY_BINDING -> listOfNotNull(propertyNameOf(written)).map { it to NO_VALUE }
            TWO_WAY_BINDING -> listOfNotNull(propertyNameOf(written)).flatMap { twoWayAttributesOf(it) }
            EVENT_BINDING -> listOfNotNull(eventNameOf(written)).map { it to NO_VALUE }
            else -> emptyList()
        }
    }

    private fun textAttributesOf(name: String, attribute: SyntaxNode): List<Pair<String, String>> = when {
        name.startsWith(BINDON_PREFIX) -> twoWayAttributesOf(name.removePrefix(BINDON_PREFIX))
        name.startsWith(BIND_PREFIX) -> listOf(name.removePrefix(BIND_PREFIX) to NO_VALUE)
        name.startsWith(ON_PREFIX) -> listOf(name.removePrefix(ON_PREFIX) to NO_VALUE)
        name == I18N || NOT_ATTRIBUTE_PREFIXES.any { name.startsWith(it) } -> emptyList()
        else -> listOf(withoutNamespace(name) to valueOf(attribute).lowercase())
    }

    private fun twoWayAttributesOf(name: String): List<Pair<String, String>> = listOf(
        name to NO_VALUE,
        name + CHANGE_EVENT_SUFFIX to NO_VALUE
    )

    // `[x]` only: `[attr.x]`, `[style.x]` and `[class.x]` bind no input
    private fun propertyNameOf(binding: SyntaxNode): String? = bindingNameOf(binding)
        ?.children()
        ?.singleOrNull()
        ?.takeIf { it.type == IDENTIFIER }
        ?.text

    // The event of `(window:resize)` is `resize`
    private fun eventNameOf(binding: SyntaxNode): String? = bindingNameOf(binding)?.text?.substringAfterLast(NAMESPACE_SEPARATOR)

    private fun bindingNameOf(binding: SyntaxNode): SyntaxNode? = binding.children().firstOrNull { it.type == BINDING_NAME }

    private fun valueOf(attribute: SyntaxNode): String {
        val quoted = attribute.children().firstOrNull { it.type == QUOTED_ATTRIBUTE_VALUE } ?: attribute
        return TreeTraversal.findFirstChildTextByType(quoted, ATTRIBUTE_VALUE).orEmpty()
    }

    private fun withoutNamespace(name: String): String = name.substringAfterLast(NAMESPACE_SEPARATOR)
}
