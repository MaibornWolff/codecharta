package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A Vue file is one component, the default export of the file. It uses the components its first template names in
 * a tag: every tag that is not one of [HTML_ELEMENTS], converted to Pascal case; a template in pug through its
 * [PugTemplate] tags.
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

    private val HTML_ELEMENTS = setOf(
        "div", "span", "p", "a", "img", "ul", "li", "ol", "table", "tr", "td", "th", "form", "input", "button", "select",
        "option", "textarea", "label", "h1", "h2", "h3", "h4", "h5", "h6", "header", "footer", "nav", "section",
        "article", "aside", "main", "br", "hr", "strong", "em", "b", "i", "code", "pre", "blockquote", "iframe", "video",
        "audio", "canvas", "svg", "path", "template"
    )

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val template = TreeTraversal.findAllDescendantsOfType(rootNode, TEMPLATE_ELEMENT).firstOrNull()
        val usedComponents = template?.let { componentNamesIn(it) }.orEmpty()
        return listOf(Declaration(name = DEFAULT_EXPORT, type = DeclarationType.CLASS, usedTypes = usedComponents))
    }

    private fun componentNamesIn(template: SyntaxNode): Set<UsedType> = tagNamesIn(template)
        .filter { tagName -> tagName.lowercase() !in HTML_ELEMENTS }
        .mapTo(LinkedHashSet()) { tagName -> UsedType(toPascalCase(tagName)) }

    private fun tagNamesIn(template: SyntaxNode): List<String> {
        if (languageOf(template) ==
            PUG
        ) {
            return PugTemplate.tagNamesOf(TreeTraversal.findAllChildrenTextByType(template, TEXT).joinToString(""))
        }
        return TreeTraversal
            .findAllDescendantsOfType(template, START_TAG, SELF_CLOSING_TAG)
            .mapNotNull { tag -> TreeTraversal.findFirstChildTextByType(tag, TAG_NAME) }
    }

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
