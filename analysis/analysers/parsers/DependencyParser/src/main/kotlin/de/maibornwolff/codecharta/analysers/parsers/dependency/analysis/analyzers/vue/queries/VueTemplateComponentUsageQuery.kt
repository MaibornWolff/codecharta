package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.find
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSQuery

class VueTemplateComponentUsageQuery(language: TSLanguage) {
    private val templateElementQuery = TSQuery(language, "(template_element) @template")
    private val nativeHtmlElements = setOf(
        "div",
        "span",
        "p",
        "a",
        "img",
        "ul",
        "li",
        "ol",
        "table",
        "tr",
        "td",
        "th",
        "form",
        "input",
        "button",
        "select",
        "option",
        "textarea",
        "label",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "footer",
        "nav",
        "section",
        "article",
        "aside",
        "main",
        "br",
        "hr",
        "strong",
        "em",
        "b",
        "i",
        "code",
        "pre",
        "blockquote",
        "iframe",
        "video",
        "audio",
        "canvas",
        "svg",
        "path",
        "template"
    )

    fun execute(rootNode: TSNode, fileBody: String): Set<String> {
        val templateMatches = rootNode.execute(templateElementQuery)

        if (templateMatches.isEmpty()) {
            return emptySet()
        }

        val templateElement = templateMatches
            .first()
            .captures
            .first()
            .node
        val componentNames = mutableSetOf<String>()

        // Extract all element tags from template
        extractComponentNames(templateElement, fileBody, componentNames)

        return componentNames
    }

    private fun extractComponentNames(node: TSNode, fileBody: String, componentNames: MutableSet<String>) {
        // Check if this is a start_tag
        if (node.type == "start_tag" || node.type == "self_closing_tag") {
            // Get tag name
            val tagNameNode = node.find("tag_name")
            val tagName = if (tagNameNode != null) nodeAsString(tagNameNode, fileBody) else null

            if (tagName != null && !isNativeHtmlElement(tagName)) {
                // Convert kebab-case to PascalCase for component name resolution
                val componentName = kebabToPascalCase(tagName)
                componentNames.add(componentName)
            }
        }

        // Recursively process children
        for (i in 0 until node.childCount) {
            extractComponentNames(node.getChild(i), fileBody, componentNames)
        }
    }

    private fun isNativeHtmlElement(tagName: String): Boolean = tagName.lowercase() in nativeHtmlElements

    private fun kebabToPascalCase(kebabCase: String): String {
        // If already PascalCase, return as is
        if (kebabCase.first().isUpperCase()) {
            return kebabCase
        }

        // Convert kebab-case to PascalCase
        return kebabCase
            .split('-')
            .joinToString("") { part ->
                part.replaceFirstChar { it.uppercase() }
            }
    }
}
