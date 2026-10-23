package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A Vue file is one component, the default export of the file. It uses the components its first template names in
 * a tag: every tag that is neither one of [HTML_ELEMENTS] nor one of Vue's [BUILT_IN_COMPONENTS], converted to Pascal
 * case and marked [COMPONENT_TAG]; a template in pug through its [PugTemplate] tags.
 */
internal object ComponentExtractor {
    private const val TEMPLATE_ELEMENT = "template_element"
    private const val START_TAG = "start_tag"
    private const val SELF_CLOSING_TAG = "self_closing_tag"
    private const val TAG_NAME = "tag_name"
    private const val TEXT = "text"
    private const val ATTRIBUTE = "attribute"
    private const val ATTRIBUTE_NAME = "attribute_name"
    private const val QUOTED_ATTRIBUTE_VALUE = "quoted_attribute_value"
    private const val ATTRIBUTE_VALUE = "attribute_value"
    private const val LANGUAGE_ATTRIBUTE = "lang"
    private const val PUG = "pug"
    private const val KEBAB_SEPARATOR = '-'
    private const val COMPONENT_TAG = "COMPONENT_TAG"

    private val HTML_ELEMENTS = setOf(
        "div", "span", "p", "a", "img", "ul", "li", "ol", "table", "tr", "td", "th", "form", "input", "button", "select",
        "option", "textarea", "label", "h1", "h2", "h3", "h4", "h5", "h6", "header", "footer", "nav", "section",
        "article", "aside", "main", "br", "hr", "strong", "em", "b", "i", "code", "pre", "blockquote", "iframe", "video",
        "audio", "canvas", "svg", "path", "template"
    )

    // In lower case without the kebab separator, so `keep-alive` and `KeepAlive` are one
    private val BUILT_IN_COMPONENTS = setOf("component", "transition", "transitiongroup", "keepalive", "teleport", "suspense", "slot")

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val template = TreeTraversal.findAllDescendantsOfType(rootNode, TEMPLATE_ELEMENT).firstOrNull()
        val usedComponents = template?.let { componentNamesIn(it) }.orEmpty()
        return listOf(Declaration(name = DEFAULT_EXPORT, type = DeclarationType.CLASS, usedTypes = usedComponents))
    }

    private fun componentNamesIn(template: SyntaxNode): Set<UsedType> = tagNamesIn(template)
        .filter { tagName -> tagName.lowercase() !in HTML_ELEMENTS && !isBuiltIn(tagName) }
        .mapTo(LinkedHashSet()) { tagName -> UsedType(toPascalCase(tagName), namespacePrefix = listOf(COMPONENT_TAG)) }

    private fun isBuiltIn(tagName: String): Boolean = tagName.lowercase().replace(KEBAB_SEPARATOR.toString(), "") in BUILT_IN_COMPONENTS

    private fun tagNamesIn(template: SyntaxNode): List<String> {
        if (languageOf(template) == PUG) return PugTemplate.tagNamesOf(textOf(template))
        return TreeTraversal
            .findAllDescendantsOfType(template, START_TAG, SELF_CLOSING_TAG)
            .mapNotNull { tag -> TreeTraversal.findFirstChildTextByType(tag, TAG_NAME) }
    }

    private fun textOf(template: SyntaxNode): String = TreeTraversal.findAllChildrenTextByType(template, TEXT).joinToString("")

    private fun languageOf(template: SyntaxNode): String? {
        val startTag = template.children().firstOrNull { it.type == START_TAG } ?: return null
        val languageAttribute = startTag.children().firstOrNull { attribute ->
            attribute.type == ATTRIBUTE && TreeTraversal.findFirstChildTextByType(attribute, ATTRIBUTE_NAME) == LANGUAGE_ATTRIBUTE
        }
        val quotedValue = languageAttribute?.children()?.firstOrNull { it.type == QUOTED_ATTRIBUTE_VALUE } ?: return null
        return TreeTraversal.findFirstChildTextByType(quotedValue, ATTRIBUTE_VALUE)?.lowercase()
    }

    private fun toPascalCase(tagName: String): String {
        if (tagName.first().isUpperCase()) return tagName
        return tagName.split(KEBAB_SEPARATOR).joinToString("") { word -> word.replaceFirstChar { it.uppercase() } }
    }
}
